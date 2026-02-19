type Element = string | number | " ";
type IndexedArrayOfElements = Array<Element>;
type MapOfSets = Map<string, BasicSet>;
export type Instructions = Array<ExpressionInstruction>;
// type SetOfElements = Set<Element> | IndexedArrayOfElements;

interface args {
  first:string,
  second?:string,
}

export class ExpressionInstruction{
  operation: OPERAND
  setName1: string
  setName2?: string

  constructor(operation: OPERAND, set1: string, set2?: string){
    this.operation = operation;
    this.setName1 = set1;
    this.setName2 = set2 ?? undefined;
  }
}

interface ExpressionStructure {
  operation: OPERAND;
  first: BasicSet;
  second?: BasicSet;
}

export class OPERAND {
  public static DIFFERENCE    =   "DIFFERENCE";
  public static COMPLIMENT    =   "COMPLIMENT";
  public static INTERSECTION  =   "INTERSECTION";
  public static UNION         =   "UNION";
};

class FORMAT {
  public static BINARY:_formatInteface = {name: "BINARY", prefix: "0b"};
  public static DECIMAL:_formatInteface = {name: "DECIMAL", prefix: "0d"};
  public static NORM_ELEM_ARRAY(arr: Array<string | number>){

    return arr.map(e =>{
      if(arr.length <= 0)return " ";

      if(typeof e === "string")
        return String(e).trim().toLowerCase();

      if(typeof e === "number")
        return e;

      throw new Error(`Invalid Element: ${typeof e}`);
    })
  }
}

interface _formatInteface{
  name: string,
  prefix?: string,
}


export class BasicSet{
  readonly name: string;
  readonly valueNumber:number;

  public constructor(name: string, valueNumber?: number){
    this.name = BasicSet.setNameFormat(name);
    this.valueNumber = valueNumber ?? 0;
  }

  static setNameFormat(name:string){
    return name.trim().toUpperCase();
  }

  //TODO add setNameForm using expressionStructure

  getValue(format: string = FORMAT.DECIMAL.name, prefixed: boolean = false, padding:number){
    // if(this.valueNumber === 0) return "∅";
    switch(format){
      case FORMAT.BINARY.name: return `${prefixed ? FORMAT.BINARY.prefix : ""}${this.valueNumber.toString(2).padStart(padding,'0')}`;
      case FORMAT.DECIMAL.name: return `${prefixed ? FORMAT.DECIMAL.prefix : ""}${this.valueNumber.toString()}`;
    }
  }

  // static createSet(name: string, array: IndexedArrayOfElements, universalSet: UniversalSet): void;
  // static createSet(name: string, val: number): void;

  static createSetFromArray(name: string, array: IndexedArrayOfElements, universalSet: UniversalSet): BasicSet{
    const val = UniversalSet.encodeUniverseValue(array, universalSet);
    if(array.length > universalSet.realElements.length) throw new Error("Elements exceeds elements of Universal Set");
    
    return BasicSet.createNewSetFromVerifiedValue(name, val, universalSet);
  }

  static createNewSetFromVerifiedValue(name: string, val: number, universalSet: UniversalSet): BasicSet{
    if(val > universalSet.maxValue) throw new Error("Value exceeds elements of Universal Set");
    return new BasicSet(name, val);
  }
}

export class SetEngine{
  register: SetRegister;

  public constructor(
    inputRegister: SetRegister,
    OperationInstructions?: Array<ExpressionInstruction>
  ){
    this.register = inputRegister; //init the register which is valid universe
    
    if(OperationInstructions) 
      for(const instruction of OperationInstructions){
        const {setName1, setName2, operation} = instruction;
        this.handleDeriveSet({first:setName1,  second:setName2}, operation);
      }

    this.debugPrint();
  }

  public handleDeriveSet(sets:args, operation: OPERAND){

    const argument_one = this.register.findSetOrThrow(sets.first);
    
    let secondsFoundArg = operation === OPERAND.COMPLIMENT ? this.register.findSetOrThrow(this.register.universalSet.name): undefined;
    if(sets.second){
      secondsFoundArg = this.register.findSetOrThrow(sets.second);
    }

    const expression: ExpressionStructure = {first: argument_one, second: secondsFoundArg, operation: operation};
    switch (expression.operation){
      case OPERAND.COMPLIMENT:   return this.createNewComplimentSet(expression);
      case OPERAND.INTERSECTION: return this.createNewIntersectionSet(expression);
      case OPERAND.UNION:        return this.createNewUnion(expression);
      case OPERAND.DIFFERENCE:   return this.createNewDifference(expression);
      default: return;
    }
  }

  private createNewComplimentSet(set:ExpressionStructure){
    const {first} = set;
    const newValue = this.register.universalSet.maxValue^(first.valueNumber);
    
    const name = `${first.name}'`;
    // console.log("Adding set")
    // this.register.createOrChange(name, UniversalSet.decodeUniverseValue(newValue, this.register.universalSet.realElements));
    this.register = this.register.writeNewSetToRegistry(BasicSet.createNewSetFromVerifiedValue(name, newValue, this.register.universalSet));
  }

  private createNewIntersectionSet(set: ExpressionStructure ){
    if(!set.second) throw new Error("Missing second argument at ");
    const {first, second } = set;
    const newValue = first.valueNumber & second.valueNumber ;
    const name = `(${first.name} ∩ ${second?.name})`;
    // this.register.writeNewSetToRegistry(name, this.universe.decodeUniverseValue(newValue));
    this.register = this.register.writeNewSetToRegistry(BasicSet.createNewSetFromVerifiedValue(name, newValue, this.register.universalSet));
  }

  private createNewUnion(set: ExpressionStructure ){
    if(!set.second) throw new Error("Missing second argument at ");
    const {first, second } = set;
    const newValue = first.valueNumber | second.valueNumber ;
    const name = `(${first.name} ∪ ${second?.name})`;
    this.register = this.register.writeNewSetToRegistry(BasicSet.createNewSetFromVerifiedValue(name, newValue, this.register.universalSet));
  }

  private createNewDifference(set: ExpressionStructure ){
    if(!set.second) throw new Error("Missing second argument at ");
    const {first, second } = set;
    const newValue = first.valueNumber ^ second.valueNumber ;
    const name = `(${first.name} / ${second?.name})`;
    this.register = this.register.writeNewSetToRegistry(BasicSet.createNewSetFromVerifiedValue(name, newValue, this.register.universalSet));
  }

  public debugPrint(): void{
    // console.clear();
    console.log("Set Engine:...");
    console.log("Registed Sets:",this.register.size);
    console.log("Sets:",this.register.printableSetKeyStream());

    console.log("For each sets:...")
    Array(...this.register.keys()).forEach(k => {
      console.log(
        `-- Set ${k} says:`, 
        this.register.findSetOrThrow(k)?.getValue(FORMAT.DECIMAL.name, true, this.register.universalSet.length), 
        this.register.findSetOrThrow(k)?.getValue(FORMAT.BINARY.name, true,this.register.universalSet.length),
        ":",
        ...this.register.getSetContentsOf(k, this.register.universalSet)
      );
    });

    console.log("Universal Set Elements:",...this.register.universalSet.realElements);
    console.log("Universal Set Max Number",this.register.universalSet.maxValue.toString(2).padStart(this.register.universalSet.length));
    
      const table = Array.from(this.register.values()).map(set=>{
        return{
          "Name": set.name,
          ...set.getValue(FORMAT.BINARY.name,false,this.register.universalSet.length)?.split("")
        }
      })

    console.table(table);
  }

}

export class UniversalSet extends BasicSet{
  readonly realElements: IndexedArrayOfElements;
  readonly maxValue;
  constructor(elements: IndexedArrayOfElements){
    const max = Math.pow(2, (elements.length))-1;
    super(BasicSet.setNameFormat("U"), max);
    this.maxValue = max;
    this.realElements = FORMAT.NORM_ELEM_ARRAY(elements); 
  }

  public get length(){
    return this.realElements.length;
  }

  public static checkIfElementsOfUniverse(array: IndexedArrayOfElements, universalElements: UniversalSet){
    for(const element of array)
      if(!universalElements.realElements.includes(element)) return false;
    return true
  }

  public static encodeUniverseValue(arrayOfElements: IndexedArrayOfElements, universalElements: UniversalSet){
    if(!arrayOfElements || arrayOfElements.length === 0) return 0;

    // const universalElements = this.elements;

    let universeValue:string = "";
    for(let i = 0; i < universalElements.length; i++){
      if(arrayOfElements.includes(universalElements.realElements[i]))
        universeValue += "1";
      else 
        universeValue += "0";
    }
    return parseInt(universeValue,2); //binary to decimal
  }

  public static decodeUniverseValue(value: number, universalElements: UniversalSet){
    // const universalElements = this.elements;

    if(value === 0) return ["∅"];
    const universeBinaryValue = value.toString(2).padStart(universalElements.length); // decmial to binary
    const universe = universalElements.realElements;
    const elements:IndexedArrayOfElements = new Array<Element>;

    for(let i = 0; i < universe.length; i++)
      if(universeBinaryValue[i] === "1") 
        elements.push(universe[i]) ;

    return elements;
  }

  // public get length()
}

export class SetRegister{
  public readonly universalSet: UniversalSet;
  private readonly registry: MapOfSets;
  // private readonly finalized: boolean;

  private constructor(registry:MapOfSets, universe: UniversalSet){
    this.universalSet = universe;
    this.registry = registry;
    // this.finalized = isFinal ?? false;
  }
  
  /*CREATION*/
  public static createNewBlankRegistryFromUniverse(universe: UniversalSet){
    return new SetRegister(new Map().set(universe.name, universe), universe)
  }

  /*CREATION*/
  public writeNewSetToRegistry(newSet: BasicSet){
    // if(this.finalized) throw new Error("Register was finalized. Cannot be edited further");
    return new SetRegister(new Map(this.registry).set(newSet.name, newSet), this.universalSet);
  }

  // /*CREATION*/
  // public freeze(){
  //   return new setRegister(this.registry, this.universalSet, true);
  // }

  public keys(){
    return this.registry.keys();
  }

  public values(){
    return this.registry.values();
  }

  public get(name: string){
    return this.registry.get(name);
  }

  public get size(){
    return this.registry.size;
  }
  
  private findSetOrUndefined(name:string){
    return this.get(BasicSet.setNameFormat(name));
  }

  public findSetOrThrow(name:string, ignoreNotFound: boolean = false){
    const found = this.findSetOrUndefined(name);
    if(!found || ignoreNotFound) throw new Error(`Set: '${name}' NOT FOUND from ${Array.from(this.registry.keys())}`);
    return found;
  }

  public printableSetKeyStream(){
    return Array(...this.keys());
  }

  public getSetContentsOf(name: string, universalSet: UniversalSet){
    const found = this.findSetOrThrow(name);
    return UniversalSet.decodeUniverseValue(found.valueNumber, universalSet);
  }
  

  // TODO: 
  // - [] name formt checker and method to check if name exists

}

// takes univserse set
// takes register of valid named sets
// returns new register of valid named sets