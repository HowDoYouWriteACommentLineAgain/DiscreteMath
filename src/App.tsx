import './App.css'
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"
import Header from './components/Header'
import SetForm from './components/SetForm'
import SetOperator from './components/SetOperator'
import {Operation, SetEngine} from './setLogic/SetEngine'
import { useEffect, useRef } from 'react'
function App() {
  

  const se = useRef<SetEngine>(null!);
  if(se.current === null) {
    se.current = new SetEngine();
  }

  useEffect(()=>{
    console.clear();
    const engine = se.current;
    engine.populateUniverseFromOneSet(["A", "B",1,2]);
    engine.createNewOrChangeBaseSet("A", ["A","B",1,2]);
    engine.createNewOrChangeBaseSet("B", ["A","B"]);
    engine.deriveSet(Operation.COMPLIMENT,"A");
    engine.deriveSet(Operation.COMPLIMENT,"B");
    engine.deriveSet(Operation.COMPLIMENT,"A'");
    // se.deriveSet('COMPLIMENT',"A");
    engine.debugPrint();
  }, [])
  


	const containerClass = "container-fluid mb-3 pt-2"
  return (
    <>
      <Header />
			<div className="d-flex justify-content-center">
				<main className="border rounded ms-4 me-5 bg-light-subtle mx-5 w-75" >
					<div id="control" className="container-fluid px-5">
						<div id="tipUniversal" className="mt-3 py-2 px-5 rounded border text-muted">
							<h4>How to use Set Calculator:</h4>
							<ol>
								<li>Define Universal set</li>
								<li>Defined base sets</li>
								<li>Defined sets based on set operations</li>
								<li>View results</li>
							</ol>
						</div>
						
						{/* -- UNIVERSAL SET -- */}
						<section id="Add" className={containerClass + " mt-1"}>
							<h3>Universal Set:</h3>
							<SetForm name='U' action={{name:"Freeze", action: undefined}} opt={{isUniverse:true}}/>
							<div id="tipUniversal" className="mt-3 py-2 ps-2 rounded border text-muted">
								TIP: Define first to unlock Set Definition
							</div>
						</section>
						
						{/* <!-- CREATE SET --> */}
						<section id="Create" className={containerClass}>
							<h3>Create Set:</h3>
							<SetForm action={{name:"Add", action: undefined}}/>
							<div id="tipUniversal" className="mt-3 py-2 ps-2 rounded border text-muted">
								TIP: Create a set or derive sets from operations
							</div>
						</section>

						{/* <!-- DERIVE SET --> */}
						<section id="operation" className={containerClass}>
							<h3>Derive Set:</h3>
							<SetOperator />
							<div id="tipUniversal" className="mt-3 py-2 ps-2 rounded border text-muted">
								TIP: Create a set or derive sets from operations
							</div>
						</section>

						
						
						{/* <!-- DEFINED SETS --> */}
						<section id="definedSets" className={containerClass}>
							<h3 className="">Output Sets:</h3>
							{/* <!-- dynamic  --> */}
							
							<div id="definedSetsList">
								<SetForm
									name='U'
									values={['a','b', 1]}
									// action={{name:"Delete", action:undefined }}
									opt={{readonly:true, color:'danger', isUniverse:true}}
								/>
								<SetForm
									name='A'
									values={['a','b']}
									action={{name:"Delete", action:undefined }}
									opt={{readonly:false, color:'danger'}}
								/>
								<SetForm
									name='B'
									values={[1]}
									action={{name:"Delete", action:undefined }}
									opt={{readonly:false, color:'danger'}}
								/>
							</div> 
						</section>
					</div>
					
					<div id="tips" className="mx-4 mb-3 py-2 ps-2 rounded border text-muted">
						TIP: Create a set or derive sets from operations
					</div>
				</main>
			</div>
    {/* <script type="module" src="./src/SetEngine.js"></script> */}
   </>
  )
}

export default App
