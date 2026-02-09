class CustomSet {
    constructor(name) {
        this.name = name;
        this.container = new Set();
        this.descendants = new Set();
        this.orphaned = false;
        return this;
    }
    add(value) {
        this.container.add(value);
    }
    orphan(descendants) {
        descendants.forEach(d => {
            d.orphaned = true;
            d.orphan(d.descendants); //idk if this will recursively delete all orphaned descendants
        });
    }
}
class SetEngine {
    get universal() {
        const _uni = new CustomSet("universal");
        this.sets.forEach(set => set.container.forEach(el => _uni.add(el)));
        return _uni;
    }
    constructor() {
        this.sets = new Map();
    }
    debugPrint() {
        console.log(this.sets, this.universal);
        console.log([...this.universal.container]);
        // console.log([...this.universal]);
    }
    createSet(name, values) {
        const set = new CustomSet(name);
        if (values) {
            values.forEach(el => set.add(el));
        }
        this.sets.set(name, set);
    }
    findSet(name) {
        return this.sets.get(name);
    }
    changeSet(name, values) {
        const foundSet = this.findSet(name);
        if (!foundSet)
            return;
        values.map(e => foundSet.add(e));
    }
}
const Engine = new SetEngine();
Engine.createSet("A", ["a", "b", "c"]);
Engine.debugPrint();
