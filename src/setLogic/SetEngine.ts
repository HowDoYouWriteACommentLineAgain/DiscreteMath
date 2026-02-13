//TODO

/*

  - [ ] split code
  - [ ] split set Engine into display, control, and formatter
  - [ ] Refactor Error handling
  - [X] Refactor Operations to handle left and right expressions not just unary ones
  - [X] Better access for getting either binary, decimal, or table format
  - [X] Table formatting display for sets and truth table
  - [ ] Add Code for checking health ie. if Subsets of U have elements not in U or also
      if subsets have changed but U has not been informed of changes
  - [X] Split BaseSubsets and Derived Subsets
  - [X] Better Logging - Throw error instead of silent returns
  - [ ] Dependency graphing for getting broken sets

  - [ ] Add Check on universe if it is still correct by checking if elements is within the universe not just if it is empty
  - [ ] Make truth table generator not just in console
  - 
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

  addDependent(dependent: BaseSet){
    this.dependents.set(dependent.name, dependent);
  }

  getValue(format: string = FORMAT.DECIMAL.name, prefixed: boolean = false, padding:number = Universal.getInstance().elementsLength){
    // if(this.valueNumber === 0) return "∅";
    switch(format){
      case FORMAT.BINARY.name: return `${prefixed ? FORMAT.BINARY.prefix : ""}${this.valueNumber.toString(2).padStart(padding,'0')}`;
      case FORMAT.DECIMAL.name: return `${prefixed ? FORMAT.DECIMAL.prefix : ""}${this.valueNumber.toString()}`;
    }
    
  }

  // change(newValue: number){
  //   this.valueNumber = newValue;
  // }
}

class Universal{
  private static instance:Universal;
  public setData: BaseSet;
  public elements: IndexedArrayOfElements;
  public maxValue: number;
  public populated:boolean;

  public constructor(){
    this.setData = new BaseSet("U");
    this.elements = [];
    this.maxValue = 0;
    this.populated = false;
  };

  public get elementsLength(){
    return this.elements.length
  }

  public checkHealth(){}

  public static getInstance(){
    if(!this.instance)
      this.instance = new Universal()
    return this.instance
  }

  public resetUniverse(){
    this.elements = [];
    this.maxValue = 0;
    this.populated = false;
  }

  public generateUniverse(SingleSet: SetOfElements){
    this.resetUniverse();
    SingleSet.forEach(el => Universal.getInstance().elements.push(el));

    const value = Math.pow(2, (Universal.getInstance().elementsLength))-1
    Universal.getInstance().maxValue = value;
    this.setData.valueNumber = value;
    this.populated = true;
  }

  public static encodeUniverseValue(arrayOfElements: IndexedArrayOfElements){
    if(!arrayOfElements || arrayOfElements.length === 0) return 0;

    const universalElements = Universal.getInstance().elements;

    let universeValue:string = "";
    for(let i = 0; i < universalElements.length; i++){
      if(arrayOfElements.includes(universalElements[i]))
        universeValue += "1";
      else 
        universeValue += "0";
    }
    return parseInt(universeValue,2); //binary to decimal
  }

  public static decodeUniverseValue(value: number){
    if(value === 0) return ["∅"];
    const universeBinaryValue = value.toString(2).padStart(Universal.getInstance().elementsLength); // decmial to binary
    const universe = Universal.getInstance().elements;
    const elements:IndexedArrayOfElements = new Array<Element>;

    for(let i = 0; i < universe.length; i++)
      if(universeBinaryValue[i] === "1") 
        elements.push(universe[i]) ;

    return elements;
  }
}


export class SetEngine{
  private readonly _setRegister:SetRegister;
  public universal: Universal;
  private hasPopulatedUniverse: boolean;

  constructor(){
    this._setRegister = new SetRegister();
    this.universal = Universal.getInstance();
    this.hasPopulatedUniverse = false;
  }

  public set setRegister(setRegister:SetRegister){
   this.setRegister = setRegister;
  }

  public get setRegister(){
    if(!this.hasPopulatedUniverse) throw new Error("UNIVERSE NOT POPULATED");  
    return this._setRegister;
  }

  public debugPrint(): void{
    console.log("Set Engine:...");
    console.log("Registed Sets:",this.setRegister.size);
    console.log("Sets:",this.setRegister.printableSetKeyStream());

    console.log("For each sets:...")
    Array(...this.setRegister.keys()).forEach(k => {
      console.log(
        `-- Set ${k} says:`, 
        this.setRegister.findSetOrUndefined(k)?.getValue(FORMAT.DECIMAL.name, true), 
        this.setRegister.findSetOrUndefined(k)?.getValue(FORMAT.BINARY.name, true),
        ":",
        ...this.setRegister.getSetContentsOf(k)
      );
    });

    console.log("Universal Set Elements:",...this.universal.elements);
    console.log("Universal Set Max Number",this.universal.maxValue.toString(2).padStart(this.universal.elementsLength));
    
      const table = Array.from(this.setRegister.values()).map(set=>{
        return{
          "Name": set.name,
          ...set.getValue(FORMAT.BINARY.name,false,this.universal.elementsLength)?.split("")
        }
      })

    console.table(table);
  }

  // private printableSetKeyStream(){
  //   return Array(...this.setRegister.keys());
  // }

  // private register(set:BaseSet){
  //   if(!this.hasPopulatedUniverse) throw new Error("UNIVERSE NOT POPULATED");
  //   this.setRegister.set(this.nameFormatter(set.name),set);
  // }
  
  // public findSetOrUndefined(name:string){
  //   return this.setRegister.get(this.nameFormatter(name));
  // }

  // public findSetOrThrow(name:string){
  //   const found = this.findSetOrUndefined(name);
  //   if(!found) throw new Error(`${found} NOT FOUND`);
  //   return found;
  // }

  // private nameFormatter(name:string){
  //   return name.trim().toUpperCase();
  // }

  populateUniverseFromOneSet(SetsOfSets:SetOfElements){
    this.universal.resetUniverse();
    this.universal.generateUniverse(SetsOfSets);
    this.hasPopulatedUniverse = true;
    this.setRegister.register(this.universal.setData);
  }

  // createOrChange(name:string, elements?: IndexedArrayOfElements){
  //   if(!this.hasPopulatedUniverse) throw new Error("UNIVERSE NOT POPULATED");

  //   const found = this.setRegister.findSetOrUndefined(name);
  //   if(!found)
  //     return this.setRegister.set(name,new BaseSet(name, 0));

  //   if(elements) 
  //     return this.setRegister.set(name,new BaseSet(name, Universal.encodeUniverseValue(elements)));
  // }

  public deriveSet(operation: Operand, {first, second}:args){
    if(!this.hasPopulatedUniverse) throw new Error("UNIVERSE NOT POPULATED");

    const firstFoundArg = this.setRegister.findSetOrThrow(first);
    
    let secondsFoundArg = operation === Operand.COMPLIMENT ? this.setRegister.findSetOrUndefined(this.universal.setData.name): undefined;
    if(second){
      secondsFoundArg = this.setRegister.findSetOrThrow(second);
    }

    const expression: ExpressionStructure = {first: firstFoundArg, second: secondsFoundArg};
    switch (operation){
      case Operand.COMPLIMENT:   return this.createNewComplimentSet(expression);
      case Operand.INTERSECTION: return this.createNewIntersectionSet(expression);
      case Operand.UNION:        return this.createNewUnion(expression);
      case Operand.DIFFERENCE:   return this.createNewDifference(expression);
      default: return;
    }
  }

  private createNewComplimentSet(set:ExpressionStructure){
    const {first} = set;
    const newValue = this.universal.maxValue^(first.valueNumber);
    
    const name = `${first.name}'`;
    this.setRegister.createOrChange(name, Universal.decodeUniverseValue(newValue));
  }

  private createNewIntersectionSet(set: ExpressionStructure ){
    if(!set.second) throw new Error("Missing second argument at ");
    const {first, second } = set;
    const newValue = first.valueNumber & second.valueNumber ;
    const name = `(${first.name} ∩ ${second?.name})`;
    this.setRegister.createOrChange(name, Universal.decodeUniverseValue(newValue));
  }

  private createNewUnion(set: ExpressionStructure ){
    if(!set.second) throw new Error("Missing second argument at ");
    const {first, second } = set;
    const newValue = first.valueNumber | second.valueNumber ;
    const name = `(${first.name} ∪ ${second?.name})`;
    this.setRegister.createOrChange(name, Universal.decodeUniverseValue(newValue));
  }

  private createNewDifference(set: ExpressionStructure ){
    if(!set.second) throw new Error("Missing second argument at ");
    const {first, second } = set;
    const newValue = first.valueNumber ^ second.valueNumber ;
    const name = `(${first.name} / ${second?.name})`;
    this.setRegister.createOrChange(name, Universal.decodeUniverseValue(newValue));
  }


  // getSetContents(name: string){
  //   const found = this.setRegister.findSetOrThrow(name);
  //   return Universal.decodeUniverseValue(found.valueNumber);
  // }

  // changeSet(name:string, values:Array<elements>){
  //   const foundSet = this.findSet(name);
  //   if(!foundSet) return;
  //   foundSet.valueNumber.clear();
  //   values.map(e => foundSet.add(e));
  // }

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
    const value = Universal.encodeUniverseValue(elements ?? []);
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