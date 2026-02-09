import './App.css'
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"
import Header from './components/Header'
import SetForm from './components/SetForm'
function App() {
  return (
    <>
      <Header />
			<div className="d-flex justify-content-center">
				<main className="border rounded ms-4 me-5 bg-light-subtle mx-5 w-75" >
					<div id="control" className="container-fluid">
						{/* <!-- NEW SET --> */}
						<div id="Add" className="container-fluid ms-3 p-3">
							<h3>New Set:</h3>
							<SetForm action={{name:"Add", action: undefined}}/>
						</div>
						
						<div id="operation" className="container-fluid p-3 ms-3">
							<h3>Derive Set:</h3>
							<div className="row g-2 align-items-center ms-2">
								
								<div className="col-2">
									<input className="form-control text-muted" name="setName1" type="text" placeholder="Name..." value="A \ B" readOnly />
								</div>
								
								<div className="col-7 d-grid">
									<button type="button" className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown">Difference</button>
									<ul className="dropdown-menu">
										<li><button type="button" className="btn btn-secondary dropdown-item active">Difference</button></li>
										<li><button type="button" className="btn btn-secondary dropdown-item">Union</button></li>
										<li><button type="button" className="btn btn-secondary dropdown-item">Intersection</button></li>
										<li><button type="button" className="btn btn-secondary dropdown-item">Compliment</button></li>
									</ul>
								</div>
								
								<div className="col-1 d-grid">
									<button type="button" className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown">A</button>
									<ul className="dropdown-menu">
										{/* <!-- dynamic data --> */}
										<li><button type="button" className="btn btn-primary dropdown-item active">A</button></li>
										<li><button type="button" className="btn btn-primary dropdown-item">B</button></li>
									</ul>
								</div>
								
								<div className="col-1 d-grid">
									<button type="button" className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown">B</button>
									<ul className="dropdown-menu">
										{/* dynamic data  */}
										<li><button type="button" className="btn btn-primary dropdown-item">A</button></li>
										<li><button type="button" className="btn btn-primary dropdown-item active">B</button></li>
									</ul>
								</div>					
							</div>
						</div>
						
						{/* <!-- DEFINED SETS --> */}
						
						<div id="definedSets" className="container-fluid p-3 ms-3">
							<h3 className="">Defined Sets:</h3>
							{/* <!-- dynamic  --> */}
							
							<div id="definedSetsList">
								<SetForm
									name='U'
									values={['a','b', 1]}
									action={{name:"Delete", action:undefined }}
									opt={{readonly:true, color:'danger'}}
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
								{/* <div className="row g-2 align-items-center mb-1">
									<div className="col-2">
										<input className="form-control  text-muted" readOnly name="setName1" type="text" placeholder="Name..." value="U" />
									</div>
									<div className="col-7">
										<input 
										readOnly={true}
										className="form-control text-muted" 
										name="setElements1" 
										type="text" 
										placeholder="Insert comma separated..."
										value="A, B, 1, 2"
										/>
									</div>
									<div className="col-3">
										<button type="button" className="btn btn-danger">Delete</button>
									</div>
								</div> */}
								{/*
								<div className="row g-2 align-items-center mb-1">
									<div className="col-2">
										<input className="form-control" name="setName1" type="text" placeholder="Name..." value="A" />
									</div>
									<div className="col-7">
										<input 
										className="form-control" 
										name="setElements1" 
										type="text" 
										placeholder="Insert comma separated..."
										value="A, B, 1, 2"
										/>
									</div>
									<div className="col-3">
										<button type="button" className="btn btn-danger">Delete</button>
									</div>
								</div>
								
								
								<div className="row g-2 align-items-center mb-1">
									<div className="col-2">
										<input className="form-control" name="setName1" type="text" placeholder="Name..." value="B" />
									</div>
									<div className="col-7">
										<input 
										className="col-7 form-control" 
										name="setElements1" 
										type="text" 
										placeholder="Insert comma separated..."
										value="A, B, 1, 2"
										/>
									</div>
									<div className="col-3">
										<button type="button" className="btn btn-danger">Delete</button>
									</div>
								</div>*/}
							</div> 
							
						</div>
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
