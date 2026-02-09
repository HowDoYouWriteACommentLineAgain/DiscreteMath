type element = string | number;
type operation = "DIFFERENCE" | "COMPLIMENT" | "INTERSECTION" | "UNION"
class CustomSet {
  name: string;
  contents: Set<element>;
  descendants:Set<string>;
  orphaned:boolean;

  constructor(name:string){
    this.name = name;
    this.contents = new Set();
    this.descendants = new Set();
    this.orphaned = false;

    return this;
  }

  add(value:element){
    this.contents.add(value);
  }

  addDescendant(name:string, list:Map<string, CustomSet>){
    if(list.get(name))
      this.descendants.add(name);
    else throw new Error("Not found");
  }

  orphan(descendants:Set<string>, list:Map<string, CustomSet>){
    Array(...descendants).forEach(n => {
      const descendant = list.get(n);
      if(descendant){
        descendant.orphaned = true;
        descendant.orphan(descendant?.descendants, list);//idk if this will recursively flag all orphaned descendants
      }
    });
  }
}

export default class SetEngine{
  public sets: Map<string, CustomSet>;
  get universal(): CustomSet{
    const _uni = new CustomSet("universal");
    this.sets.forEach(set=> set.contents.forEach(el => _uni.add(el)))
    return _uni;
  }

  constructor(){
    this.sets = new Map();
  }

  debugPrint(){
    console.clear();
    console.log("Set Engine:...");
    console.log("says",this.sets.entries());
    console.log("Sets",this.sets.keys())

    console.log("For each sets:...")
    Array(...this.sets.keys()).forEach(k => {
      console.log(`-- Set ${k} says:`, this.sets.get(k)?.contents);
      console.log(`-- Set ${k} has descendants:`, this.sets.get(k)?.descendants);
    });

    console.log("Universal",[...this.universal.contents]);
  }

  createSet(name:string, values?:Array<element>){
    const set = this.findSet(name) ?? new CustomSet(name);
    if(values){
      values.forEach(el => set.add(el));
    }

    this.sets.set(name, set);
  }

  deriveSet(op: operation, a1:string, a2?:string){
    const set1 = this.sets.get(a1);
    if(!set1) return;

    const set2 = this.sets.get(a2!);;
    if(a2 && !set2) return;

    let result: CustomSet; 
    switch(op){
      case "COMPLIMENT": result = this.getCompliment(set1)!;
    }

    if(result!){
      set1.addDescendant(result.name, this.sets);
      if (set2) 
        set2.addDescendant(result!.name, this.sets);
    }

  }

  getCompliment(set:CustomSet){
    const contents = Array(...this.universal.contents).filter(u => !set.contents.has(u));
    const name = `${set.name}'`;
    this.createSet(name, contents);
    return this.findSet(name);
  }

  findSet(name:string){
    return this.sets.get(name);
  }

  changeSet(name:string, values:Array<element>){
    const foundSet = this.findSet(name);
    if(!foundSet) return;
    foundSet.contents.clear();
    values.map(e => foundSet.add(e));
  }

}

// const Engine = new SetEngine();

// Engine.createSet("A", ["a", "b", "c"]);