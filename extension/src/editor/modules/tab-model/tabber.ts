import EventBus from "diagram-js/lib/core/EventBus";
import Selection from "diagram-js/lib/features/selection/Selection";
import ElementRegistry from "diagram-js/lib/core/ElementRegistry";
import { ShapeLike } from "diagram-js/lib/model/Types";
import { isConnection } from "diagram-js/lib/util/ModelUtil";

export const PREFIX = 'tab-model';
export type TabModelState = 'tab' | 'shift.back' | 'shift.forward';

interface TabGraphNode {
    id: string; // unique identifier for the node
    position: number; // position in the tab order
}

interface TabGraph {
    nodes: Map<string , TabGraphNode>; 
    orderedNodes: TabGraphNode[]; 
}

class TabGraphController implements TabGraph {
    nodes: Map<string , TabGraphNode>; 
    orderedNodes: TabGraphNode[];   
 
    constructor() {
        this.nodes = new Map<string, TabGraphNode>();
        this.orderedNodes = new Array<TabGraphNode>();
    }

    insert(element: ShapeLike){
        // create a new TabGraphNode for the element
        const node: TabGraphNode = {
            id: element.id,
            position: this._calculatePosition(element)
        };

        // insert the node into the graph
        this.nodes.set(node.id, node);

        // insert the node into the ordered list
        this.orderedNodes.push(node);
        this.sort();
    }

    update(element: ShapeLike) {
        // update the position of the node in the graph
        const node = this.nodes.get(element.id);
        if (node) {
            node.position = this._calculatePosition(element);
        }
    }

    remove(element: ShapeLike) {
        // remove the node from the graph
        const node = this.nodes.get(element.id);
        if (node) {
            this.nodes.delete(node.id);
            this.orderedNodes = this.orderedNodes.filter(n => n.id !== node.id);
        }
    }

    sort() {
        this.orderedNodes.sort((a, b) => a.position - b.position);
    }

    first(): TabGraphNode | undefined {
        // return the first node in the ordered list
        return this.orderedNodes.length > 0 ? this.orderedNodes[0] : undefined;
    }

    next(element: ShapeLike): TabGraphNode | undefined {
        // find the next node in the ordered list
        const currentNode = this.nodes.get(element.id);
        if (currentNode) {
            const index = this.orderedNodes.indexOf(currentNode);
            if (index >= 0 && index < this.orderedNodes.length - 1) {
                return this.orderedNodes[index + 1];
            }
        }
        return undefined;
    }

    _calculatePosition(element: ShapeLike): number {
        const bounds = { x : element.x, y: element.y };
        // Use Manhattan distance from top-left, with (x+y) as tiebreaker
        return (bounds.x + bounds.y) * 1000 + bounds.x + bounds.y;
    }
    
}

interface TabHistoryNode {
    last: TabHistoryNode | undefined; // reference to the last node in the history
    next: TabHistoryNode | undefined; // reference to the next node in the history
    node: TabGraphNode; // the node that was selected
    isSpilt: boolean; // whether the node was split
    split?: TabHistoryNode; // the split node, if any
}

interface TabHistory {
    history: TabHistoryNode[]; // array of history nodes
}

class TabHistoryController implements TabHistory {
    history: TabHistoryNode[];
    _current: TabHistoryNode | undefined; 

    constructor() {
        this.history = [];
        this._current = undefined;
    }

    insert(node: TabGraphNode) {
        // create a new history node
        const laster = this._current ? this._current : undefined;
        const historyNode: TabHistoryNode = {
            last: laster,
            next: undefined,
            node: node,
            isSpilt: false,
            split: undefined
        };

        // if there is a current node, link it to the new node
        if (this._current) {
            this._current.next = historyNode;
            historyNode.last = this._current;
        }

        this._current = historyNode;
        this.history.push(historyNode);
    }

    remove() {

    }

    current(): TabHistoryNode | undefined {
        return this._current; 
    }

    next(): TabHistoryNode | undefined {
        if (this._current && this._current.next) {
            this._current = this._current.next;

            this._recursivelyRemoveSplit(this._current);

            return this._current;
        }
        return undefined;
    }

    back(): TabHistoryNode | undefined {
        if (this._current && this._current.last) {
            this._current = this._current.last;

            this._recursivelyRemoveSplit(this._current);

            return this._current;
        }
        return undefined;
    }

    _recursivelyRemoveSplit(node: TabHistoryNode) {
        var that = this;

        function remover(nodeToRemove: TabHistoryNode) {
            if (nodeToRemove.next) {
                // recursively remove the split node
                remover(nodeToRemove.next);
            }
            // Clean up circular references before removing
            if (nodeToRemove.last) {
                nodeToRemove.last.next = undefined;
            }
            if (nodeToRemove.next) {
                nodeToRemove.next.last = undefined;
            }
            // remove the node from the history
            that.history = that.history.filter(n => n !== nodeToRemove);
        }

        if (node.isSpilt && node.split) {
            // if the node is split, remove the split node
            remover(node.split);
        }

        node.isSpilt = false; 
        node.split = undefined; 
    }

    split(node:TabGraphNode): TabHistoryNode | undefined {
        if (this._current) {
            this._current.isSpilt = true;

            // create a new history node for the split
            const splitNode: TabHistoryNode = {
                last: this._current,
                next: undefined,
                node: node,
                isSpilt: true,
                split: undefined
            };

            this._current.split = splitNode;
            this.history.push(splitNode);
            this._current = splitNode;
        }
        return undefined;
    }

    reset() {
        this.history = [];
        this._current = undefined;
    }
}

const PRIORITY = 2000; 

export default class TabModel { 

    static $inject = [ 'eventBus', 'elementRegistry', 'selection',  ];
    private _bus: EventBus;
    private _selection: Selection;
    private _elementRegistry: ElementRegistry;
    private _tabGraph: TabGraphController; 
    private _tabHistory: TabHistoryController; 
    private _cache: TabHistoryController | undefined; 
    private _cachedLast: ShapeLike | undefined; 

    constructor(
        eventBus:EventBus, elementRegistry:ElementRegistry, 
        selection:Selection) {
        this._bus = eventBus;
        this._elementRegistry = elementRegistry;
        this._selection = selection;
        this._tabHistory = new TabHistoryController();
        this._tabGraph = new TabGraphController();

        // internal state triggers
        this._bus.on(`${PREFIX}.tab`, this.tab.bind(this));
        this._bus.on(`${PREFIX}.shift.back`, this.shiftBack.bind(this));
        this._bus.on(`${PREFIX}.shift.forward`, this.shiftForward.bind(this));

        // external watchers 
        this._bus.on('shape.created', PRIORITY, this.handleCreation.bind(this));
        this._bus.on('element.changed', PRIORITY, this.handleUpdate.bind(this));
        this._bus.on(['shape.removed'], PRIORITY, this.handleDeletion.bind(this));
        this._bus.on('selection.changed', PRIORITY, this.handleSelectionChange.bind(this));

        // state management
        this._bus.on(['constraint-builder.create', 'tab-mode.store'], PRIORITY + 250, this.cache.bind(this));
        this._bus.on(['constraint-builder.closed', 'tab-mode.restore'], PRIORITY + 250, this.renew.bind(this));
    }

    cache(event:any) {
        // Create a deep copy of the tab history to avoid shared references
        const cache = new TabHistoryController();
        cache.history = this._tabHistory.history.map(node => ({
            last: node.last,
            next: node.next,
            node: { ...node.node },
            isSpilt: node.isSpilt,
            split: node.split
        }));
        cache._current = Object.assign( {} , this._tabHistory._current );
        console.log('TabModel.cache: store history', cache);
        this._cache = cache;
    }

    renew(event:any) {
        if (this._cache) {
            const renew = Object.assign( new TabHistoryController() , this._cache);
            console.log('TabModel.renew: restore history', renew);
            this._tabHistory = renew;
            this._cache = undefined;
        } else {
            console.warn('TabModel.renew: no cache to restore from');
        }
    }

    /**
     * Fires a known tab model state to the event bus.
     * @param {TabModelState} state triggerable state
     * @param {object} context context to pass along with the event
     */
    fire(state:TabModelState, context:any = {}) {
        this._bus.fire(
            `${PREFIX}.${state}`,
            Object.assign({}, context)
        );
    }

    /**
     * tries to find the next related element in the tab graph
     * @param event 
     */
    tab(event:any) {
        // find the current selection
        let current = this._selection.get();
        let selected: ShapeLike | undefined = undefined;
        if (current && current.length > 0) {
            selected = current[0];
        }
        // now shift the selection to the next related and closest element
        if (selected) {
            // find the next element in the tab graph
            const nextNode = this._tabGraph.next(selected);
            if (nextNode) {
                this._selection.select([
                    this._elementRegistry.get(nextNode.id)
                ]);
            } else {
                let firstNode = this._tabGraph.first();
                if (firstNode) {
                    this._selection.select([
                        this._elementRegistry.get(firstNode.id)
                    ]);
                }
            }
        } else {
            let firstNode = this._tabGraph.first();
            if (firstNode) {
                this._selection.select([
                    this._elementRegistry.get(firstNode.id)
                ]);
            }
        }
    }

    /**
     * tries to shift the selection back in the tab history
     * @param event 
     * @returns 
     */
    shiftBack(event:any) {
        // go back in the tab history to last selection/tab
        const current = this._tabHistory.current();
        if (current && current.last) {
            // we have a last node, so go back to it
            const element = this._elementRegistry.get(current.last.node.id);
            if (element) {
                this._selection.select([element]);
            } else {
                console.warn('TabModel.shiftBack: last element not found in element registry', current.last.node.id);
            }
        } else {
            console.warn('TabModel.shiftBack: no last node in tab history');
        }
    }

    /**
     * tries to shift the selection forward in the tab history
     * @param event 
     * @returns 
     */
    shiftForward(event:any) {
        // go foward in the tab history to last selection/tab
        const current = this._tabHistory.current();
        if (current && current.next) {
            // we have a next node, so go forward to it
            const nextNode = current.next;
            if (nextNode) {
                const element = this._elementRegistry.get(nextNode.node.id);
                if (element) {
                    this._selection.select([element]);
                } else {
                    console.warn('TabModel.shiftForward: next element not found in element registry', nextNode.node.id);
                }
            }
        } else {
            console.warn('TabModel.shiftForward: no next node in tab history');
        }

    }

    /**
     * Processes the creation of a new element in the tab graph.
     * @param event 
     */
    handleCreation(event:any) {
        // add the newly created element to the tab graph
        switch (event.type) {
            case 'shape.created':
                this._tabGraph.insert(event.shape);
                break;
            default:
                console.warn('TabModel.handleCreation: unknown event type', event.type);
                break;
        }
    }

    handleUpdate(event:any) {
        // handle updates to existing elements, e.g. position changes
        switch (event.type) {
            case 'element.changed':
                const element = event.element;
                if (element) {
                    this._tabGraph.update(element);
                    this._tabGraph.sort();
                }
                break;
            case 'elements.moved':
                for(let element of event.elements) {
                    this._tabGraph.update(element);
                }
                this._tabGraph.sort();
                break;
            default:
                console.warn('TabModel.handleUpdate: unknown event type', event.type);
                break;
        }
    }

    /**
     * Processes the deletion of an element in the tab graph.
     * @param event 
     */
    handleDeletion(event:any) {
        // remove the deleted element from the tab graph
        switch (event.type) {
            case 'shape.removed':
                this._tabGraph.remove(event.element);
                break;
            default:
                console.warn('TabModel.handleDeletion: unknown event type', event.type);
                break;
        }
    }

    handleSelectionChange(event:any) {
        // handle selection changes, update the tab graph and history accordingly
        let lastSelected: Array<ShapeLike> = event.oldSelection,
            newSelected: Array<ShapeLike> = event.newSelection;

        // handle the case when the selection contains connections 
        if (lastSelected.length > 1 || newSelected.length > 1) {
            return; 
        } 
        if (newSelected.length === 1 && lastSelected.length === 0) {
            // check if the last selected element is a connection
            const newElement = newSelected[0];
             if (isConnection(newElement)) {
                return;
            }
        }
        if (newSelected.length === 1 && lastSelected.length === 1) {
            // check if the new selected element is a connection
            const newElement = newSelected[0];
            const lastElement = lastSelected[0];
            const current = this._tabHistory.current();
            // edge cases for handling movement between connections
            if (isConnection(newElement) && isConnection(lastElement) ) {
                return;
            } else if (isConnection(newElement) && current && !current.isSpilt) {
                this._tabHistory.split(current.node);
                return;
            } else if (!isConnection(newElement) && isConnection(lastElement) && current) {
                this._tabHistory.back();
                return;
            } 
        }

        if (newSelected.length === 0) {
            // no new selection, reset the tab history
            this._tabHistory.reset();
            this._cachedLast = undefined;
        } else if (newSelected.length === 1) {
            // need to work out if we are adding or between existing nodes 
            // of the history
            let nextElement: ShapeLike = newSelected[0];
            let lastElement: ShapeLike | undefined = undefined;
            if (lastSelected.length > 0) {
                lastElement = lastSelected[0];
            }
            
            if (!this._tabHistory.current() || !lastElement) {
                // there is no past, so add next 
                const node = this._tabGraph.nodes.get(nextElement.id);
                if (node) {
                    this._tabHistory.insert(node);
                } else {
                    console.warn('TabModel.handleSelectionChange: selected'
                        +'element not found in tab graph', nextElement.id
                    );
                }
            } else {
                // there is a past, so are we betweem or adding to the history?
                const currentNode = this._tabHistory.current()!;
                const lastNode = this._tabGraph.nodes.get(lastElement.id)!;
                const nextNode = this._tabGraph.nodes.get(nextElement.id)!;

                if (currentNode.node.id === lastNode.id && currentNode.next?.node.id === nextNode.id) {
                    // we are between and shifting matches the current history
                    this._tabHistory.next();
                } else if (currentNode.node.id === lastNode.id && currentNode.last?.node.id === nextNode.id) {
                    // we are between and shifting matches the current history
                    this._tabHistory.back();
                } else if (currentNode.node.id === lastNode.id && currentNode.next === undefined) {
                    // we are adding to the history
                    if (nextNode) {
                        this._tabHistory.insert(nextNode);
                    } else {
                        console.warn('TabModel.handleSelectionChange: next element not found in tab graph', nextElement.id);
                    }
                } else {
                    // we are in some known state, but we are agreeing with
                    // the current history, so we must split on the current node
                    this._tabHistory.split(nextNode);                
                }
            }
            
        }
    }
}