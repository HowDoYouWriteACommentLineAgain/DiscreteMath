//TODO

/*

    # MAJOR
  - [ ] Add Code for checking health ie. if Subsets of U have elements not in U or also
      if subsets have changed but U has not been informed of changes
  - [ ] Refactor Error handling
  - [ ] Add Check on universe if it is still correct by checking if elements is within 
        the universe not just if it is empty. tldr: validate universe encoding
  - [ ]
  - [ ] split code
  - [ ] split set Engine into display, control, and formatter
  - [X] Refactor Operations to handle left and right expressions not just unary ones
  - [X] Better access for getting either binary, decimal, or table format
  - [X] Table formatting display for sets and truth table
  - [X] Split BaseSubsets and Derived Subsets
  - [X] Better Logging - Throw error instead of silent returns
  
  
  - [ ] Make truth table generator not just in console
  - [ ] Create tests
  - [ ] Make universe not a 

  - ~[~] Dependency graphing for getting broken sets~
*/


type Element = string | number | " ";
type IndexedArrayOfElements = Array<Element>;
type MapOfSets = Map<string, BaseSet>;
type SetOfElements = Set<Element> | IndexedArrayOfElements;

// type SetOfSets = Set<SetsOfElement> | Array<SetsOfElement>;

interface args {
  first:string,
  second?:string,
}

interface ExpressionStructure {
  first: BaseSet;
  second?: BaseSet;
  operation: Operand;
}

export class Operand {
  public static DIFFERENCE    =   "DIFFERENCE";
  public static COMPLIMENT    =   "COMPLIMENT";
  public static INTERSECTION  =   "INTERSECTION";
  public static UNION         =   "UNION";
};

interface formatInteface{
  name: string,
  prefix?: string,
}

class FORMAT {
  public static BINARY:formatInteface = {name: "BINARY", prefix: "0b"};
  public static DECIMAL:formatInteface = {name: "DECIMAL", prefix: "0d"};
}

class BaseSet{
  name: string;
  valueNumber:number;
  derived:boolean;
  dependents: MapOfSets;

  constructor(name: string, valueNumber?: number){
    this.name = BaseSet.setNameFormat(name);
    this.valueNumber = valueNumber ?? 0;
    this.derived = false;
    this.dependents = new Map();

  }

  static setNameFormat(name:string){
    return name.trim().toUpperCase();
  }

  getValue(format: string = FORMAT.DECIMAL.name, prefixed: boolean = false, padding:number){
    // if(this.valueNumber === 0) return "∅";
    switch(format){
      case FORMAT.BINARY.name: return `${prefixed ? FORMAT.BINARY.prefix : ""}${this.valueNumber.toString(2).padStart(padding,'0')}`;
      case FORMAT.DECIMAL.name: return `${prefixed ? FORMAT.DECIMAL.prefix : ""}${this.valueNumber.toString()}`;
    }
    
  }

}

class Universal{
  // private static instance:Universal;
  public setData: BaseSet;
  public elements: IndexedArrayOfElements;
  public maxValue: number;
  // public populated:boolean;

  public constructor(elements: IndexedArrayOfElements){
    this.setData = new BaseSet("U");
    this.elements = [...elements];
    this.maxValue = Math.pow(2, (elements.length))-1;
    // this.populated = false;
  };

  public get length(){
    return this.elements.length;
  }

  // public get elementsLength(){
  //   return this.elements.length
  // }

  // public static getInstance(){
  //   if(!this.instance)
  //     this.instance = new Universal()
  //   return this.instance
  // }

  // public resetUniverse(){
  //   this.elements = [];
  //   this.maxValue = 0;
  //   this.populated = false;
  // }

  // public generateUniverse(SingleSet: SetOfElements){
  //   this.resetUniverse();
  //   SingleSet.forEach(el => Universal.getInstance().elements.push(el));

  //   const value = Math.pow(2, (Universal.getInstance().elementsLength))-1
  //   Universal.getInstance().maxValue = value;
  //   this.setData.valueNumber = value;
  //   this.populated = true;
  // }

  public static encodeUniverseValue(arrayOfElements: IndexedArrayOfElements, universalElements: IndexedArrayOfElements){
    if(!arrayOfElements || arrayOfElements.length === 0) return 0;

    // const universalElements = this.elements;

    let universeValue:string = "";
    for(let i = 0; i < universalElements.length; i++){
      if(arrayOfElements.includes(universalElements[i]))
        universeValue += "1";
      else 
        universeValue += "0";
    }
    return parseInt(universeValue,2); //binary to decimal
  }

  public static decodeUniverseValue(value: number, universalElements: IndexedArrayOfElements){
    // const universalElements = this.elements;

    if(value === 0) return ["∅"];
    const universeBinaryValue = value.toString(2).padStart(universalElements.length); // decmial to binary
    const universe = universalElements;
    const elements:IndexedArrayOfElements = new Array<Element>;

    for(let i = 0; i < universe.length; i++)
      if(universeBinaryValue[i] === "1") 
        elements.push(universe[i]) ;

    return elements;
  }
}


export class SetEngine{
  private readonly setRegister:SetRegister;
  private universe: Universal;

  constructor(
    universalElements: IndexedArrayOfElements,
    initialSubSets: Map<string, IndexedArrayOfElements>,
    operations: Array<{args:args, operation: Operand}>
  ){

    this.setRegister = new SetRegister();
    this.universe = new Universal(universalElements);

    Array
    .from(initialSubSets.entries())
    .forEach(v => this.setRegister.createOrChange(v[0], v[1])); //this prolly has to check if subsets are valid as well among other checks

    operations
    .forEach(op => this.deriveSet(op.args, op.operation));

    

  }

  /*
  
  opt{
    universe: []: IndexedArrayOfElements
    initial_subsets: [[name:string, elements: baseSet], ...Map<name, BaseSet> | Object.entries<name, BaseSet>]
    do_operations: : [...operations: {Operand, {first: String, second?: String}}]

    name is always either `singleCapital` | `singleCapital'` | `(singleCapital Operand singleCapital)`

    eg. A, A', `(A ${Operand.Union} B)`
    note: add baseSet name maker for names
  }
  
  */

  // public set setRegister(setRegister:SetRegister){
  //  this.setRegister = setRegister;
  // }

  // public get setRegister(){
  //   if(!this.hasPopulatedUniverse) throw new Error("UNIVERSE NOT POPULATED");  
  //   return this._setRegister;
  // }

  public debugPrint(): void{
    console.log("Set Engine:...");
    console.log("Registed Sets:",this.setRegister.size);
    console.log("Sets:",this.setRegister.printableSetKeyStream());

    console.log("For each sets:...")
    Array(...this.setRegister.keys()).forEach(k => {
      console.log(
        `-- Set ${k} says:`, 
        this.setRegister.findSetOrUndefined(k)?.getValue(FORMAT.DECIMAL.name, true, this.universe.length), 
        this.setRegister.findSetOrUndefined(k)?.getValue(FORMAT.BINARY.name, true,this.universe.length),
        ":",
        ...this.setRegister.getSetContentsOf(k)
      );
    });

    console.log("Universal Set Elements:",...this.universe.elements);
    console.log("Universal Set Max Number",this.universe.maxValue.toString(2).padStart(this.universe.length));
    
      const table = Array.from(this.setRegister.values()).map(set=>{
        return{
          "Name": set.name,
          ...set.getValue(FORMAT.BINARY.name,false,this.universe.length)?.split("")
        }
      })

    console.table(table);
  }

  


  public deriveSet(sets:args, operation: Operand){

    const firstFoundArg = this.setRegister.findSetOrThrow(sets.first);
    
    let secondsFoundArg = operation === Operand.COMPLIMENT ? this.setRegister.findSetOrUndefined(this.universe.setData.name): undefined;
    if(sets.second){
      secondsFoundArg = this.setRegister.findSetOrThrow(sets.second);
    }

    const expression: ExpressionStructure = {first: firstFoundArg, second: secondsFoundArg, operation: operation};
    switch (expression.operation){
      case Operand.COMPLIMENT:   return this.createNewComplimentSet(expression);
      case Operand.INTERSECTION: return this.createNewIntersectionSet(expression);
      case Operand.UNION:        return this.createNewUnion(expression);
      case Operand.DIFFERENCE:   return this.createNewDifference(expression);
      default: return;
    }
  }

  private createNewComplimentSet(set:ExpressionStructure){
    const {first} = set;
    const newValue = this.universe.maxValue^(first.valueNumber);
    
    const name = `${first.name}'`;
    this.setRegister.createOrChange(name, this.universe.decodeUniverseValue(newValue, this.universe.elements));
  }

  private createNewIntersectionSet(set: ExpressionStructure ){
    if(!set.second) throw new Error("Missing second argument at ");
    const {first, second } = set;
    const newValue = first.valueNumber & second.valueNumber ;
    const name = `(${first.name} ∩ ${second?.name})`;
    this.setRegister.createOrChange(name, this.universe.decodeUniverseValue(newValue));
  }

  private createNewUnion(set: ExpressionStructure ){
    if(!set.second) throw new Error("Missing second argument at ");
    const {first, second } = set;
    const newValue = first.valueNumber | second.valueNumber ;
    const name = `(${first.name} ∪ ${second?.name})`;
    this.setRegister.createOrChange(name, this.universe.decodeUniverseValue(newValue));
  }

  private createNewDifference(set: ExpressionStructure ){
    if(!set.second) throw new Error("Missing second argument at ");
    const {first, second } = set;
    const newValue = first.valueNumber ^ second.valueNumber ;
    const name = `(${first.name} / ${second?.name})`;
    this.setRegister.createOrChange(name, this.universe.decodeUniverseValue(newValue));
  }

}

class SetRegister{
  registry: MapOfSets;

  constructor(){
    this.registry = new Map() as MapOfSets;
  }

  get size(){
    return this.registry.size;
  }

  public keys(){
    return this.registry.keys();
  }
  public values(){
    return this.registry.values();
  }

  public set(name: string, set:BaseSet){
    this.registry.set(BaseSet.setNameFormat(name), set);
  }

  public get(name: string){
    return this.registry.get(name);
  }

  public register(set:BaseSet){
    this.set(set.name,set);
    return this.findSetOrThrow(set.name);
  }
  
  public findSetOrUndefined(name:string){
    return this.get(BaseSet.setNameFormat(name));
  }

  public findSetOrThrow(name:string){
    const found = this.findSetOrUndefined(name);
    if(!found) throw new Error(`${found} NOT FOUND`);
    return found;
  }

  public printableSetKeyStream(){
    return Array(...this.keys());
  }

  public createOrChange(name:string, elements?: IndexedArrayOfElements){
    // if(!this.hasPopulatedUniverse) throw new Error("UNIVERSE NOT POPULATED");

    const found = this.findSetOrUndefined(name);
    const value = this.universe.encodeUniverseValue(elements ?? []);
    if(!found)
      return this.set(name,new BaseSet(name, value));

    if(elements) 
      return found.valueNumber = value;
  }

  public getSetContentsOf(name: string){
    const found = this.findSetOrThrow(name);
    return Universal.decodeUniverseValue(found.valueNumber);
  }
}

// class SetMaker {
//   private constructor(){};



//   static createNewOrChangeBaseSet(name:string, elements?: IndexedArrayOfElements){
//     if(!this.hasPopulatedUniverse) throw new Error("UNIVERSE NOT POPULATED");

//     let found = this.findSet(name);
//     if(!found) {
//       found = new BaseSet(name, 0);
//     }

//     if(elements) found.valueNumber = this.universal.encodeUniverseValue(elements);
//     this.register(found);
//   }


// }

// class SetErrorHandler{
  
// }


// const Engine = new SetEngine();

// Engine.createNewOrChangeBaseSet("A", ["a", "b", "c"]);