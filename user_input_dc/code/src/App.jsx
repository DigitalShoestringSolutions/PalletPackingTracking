import 'bootstrap/dist/css/bootstrap.css';
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Pagination from 'react-bootstrap/Pagination'
import Table from 'react-bootstrap/Table'
import Carousel from 'react-bootstrap/Carousel'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Container from 'react-bootstrap/Container'
import { MQTTProvider, useMQTTControl, useMQTTDispatch, useMQTTState } from './MQTTContext'
import React from 'react';
import APIBackend from './RestAPI'
import './app.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { custom_new_message_action, CustomReducer } from './custom_mqtt';
import { Alert, Badge, Form, InputGroup } from 'react-bootstrap';
import SignatureCanvas from 'react-signature-canvas'


function App() {
  let [loaded, setLoaded] = React.useState(false)
  let [pending, setPending] = React.useState(false)
  let [error, setError] = React.useState(null)
  let [config, setConfig] = React.useState([])

  React.useEffect(() => {
    let do_load = async () => {
      setPending(true)
      try {
        let response = await APIBackend.api_get('http://' + document.location.host + '/config/config.json');
        if (response.status === 200) {
          const raw_conf = response.payload;
          console.log("config", raw_conf)
          setConfig(raw_conf)
          setLoaded(true)
        } else {
          console.log("ERROR LOADING CONFIG")
          setError("ERROR: Unable to load configuration!")
        }
      } catch (err) {
        console.err(err);
        setError("ERROR: Unable to load configuration!")
      }
    }
    if (!loaded && !pending) {
      do_load()
    }
  }, [loaded, pending])

  React.useEffect(() => {



  })

  if (!loaded) {
    return <Container fluid="md">
      <Card className='mt-2 text-center'>
        {error !== null ? <h1>{error}</h1> : <div><Spinner></Spinner> <h2 className='d-inline'>Loading Config</h2></div>}
      </Card>
    </Container>
  } else {
    return (
      <MQTTProvider
        host={config?.mqtt?.host ? config.mqtt.host : document.location.hostname}
        port={config?.mqtt?.port ?? 9001}
        prefix={config?.mqtt?.prefix ?? []}
        // subscriptions={["delivery_details/" + config.id, "status/" + config.id + "/alive"]}
        new_message_action={custom_new_message_action}
        reducer={CustomReducer}
        initial_state={{ product: "", expires: null, batch: "", quantity: "" }}
        debug={true}
      >
        <Dashboard config={config} />
      </MQTTProvider>
    )
  }


  

}

function Dashboard({ config = {} }) {
  // let [loaded, setLoaded] = React.useState(false)
  // let [pending, setPending] = React.useState(false)

  // let [error, setError] = React.useState(undefined)


  let { connected } = useMQTTState()
  let variant = "danger"
  let text = "Disconnected"
  if (connected) {
    variant = "success"
    text = "Connected"
  }

  return (
    <Container fluid className="vh-100 p-0 d-flex flex-column">
      <Container fluid className="flex-grow-1 px-1 pt-2 px-sm-2">
        <Row className="m-0 mx-2 d-flex justify-content-center pt-2 pb-2">
          <Col>
            {/* <CurrentStatus /> */}
            <BatchForm config={config} />
          </Col>
        </Row>
      </Container>

      <div className='bottom_bar'>
        <ButtonGroup aria-label="Basic example">
          <OverlayTrigger
            placement='top'
            overlay={
              <Tooltip>
                Live updates over MQTT: {text}
              </Tooltip>
            }
          >
            <Button variant={variant} className='bi bi-rss'>{" " + text}</Button>
          </OverlayTrigger>
        </ButtonGroup>
      </div>
      
    </Container>
  )
}


function BatchForm({ config }) {
  let [supplier, setSupplier] = React.useState("")
  let [variety, setVariety] = React.useState("")
  let [customer, setCustomer] = React.useState("")
  let [handpicked, setHandpicked] = React.useState("")
  let [grapeCode, setgrapeCode] = React.useState("")
  let [fruitCondition, setFruitCondition] = React.useState("")
  let [mog, setMog] = React.useState("")
  let [comments, setComments] = React.useState("")
  let [grossWeights, setGrossWeights] = React.useState(Array(boxCount))
  const [boxCount, setBoxCount] = React.useState(1);
  let totalGrossWeight = grossWeights.reduce((total, weight) => total + parseFloat(weight), 0);
  let [tare, setTare] = React.useState("")
  let totalNetWeight =  totalGrossWeight-(boxCount*tare);
  let [loaded1, setLoaded1] = React.useState(false)
  let [loaded2, setLoaded2] = React.useState(false)
  let [pending1, setPending1] = React.useState(false)
  let [pending2, setPending2] = React.useState(false)
  let [suggestedSuppliers, setSuggestedSuppliers] = React.useState([])
  let [suggestedUsers, setSuggestedUsers] = React.useState([])
  let [user, setUser] = React.useState("")
  let [binIds, setBinIds] = React.useState(Array(boxCount))
  let bins = grossWeights.map((grossWeight, index) => {return {binID: binIds[index],grossWeight: grossWeight, netWeight:(grossWeight-tare)};});

  React.useEffect(() => {
    let do_load = async () => {
      try {
        let response = await APIBackend.api_get('http://' + document.location.host + ':8001/deliveries/suppliers');
        if (response.status === 200) {
          const raw_suppliers = response.payload;
          console.log("suppliers:", raw_suppliers)
          setSuggestedSuppliers(raw_suppliers.map(item => item.supplier))
          // setConfig(raw_conf)
          // setLoaded(true)
        } else {
          console.log("ERROR LOADING SUPPLIERS")
        }
      } catch (err) {
        console.err(err);
      }
    }
    if (!loaded1 && !pending1) {
      do_load()
    }
  }, [loaded1, pending1])
    

  React.useEffect(() => {
    let do_load = async () => {
      try {
        let response = await APIBackend.api_get('http://' + document.location.host + ':8001/deliveries/users');
        if (response.status === 200) {
          const raw_users= response.payload;
          console.log("users:", raw_users)
          setSuggestedUsers(raw_users.map(item => item.initial))
          // setConfig(raw_conf)
          // setLoaded(true)
        } else {
          console.log("ERROR LOADING USERS")
        }
      } catch (err) {
        console.err(err);
      }
    }
    if (!loaded2 && !pending2) {
      do_load()
    }
  }, [loaded2, pending2])


 


  const mogOptions = [];
  for(let i = 1; i <= 10; i++) {
    mogOptions.push(<option key={i} value={i}> {i}</option>);
  }
  

  const handleClick = () => {
    setBoxCount(boxCount + 1);
    updateWeights(boxCount + 1);
    updateBinIds(boxCount + 1);

  };
  const handleNegClick = () => {
    setBoxCount(boxCount - 1);
    updateWeights(boxCount - 1);
    updateBinIds(boxCount - 1);


  };

  function updateWeights(newBoxCount) {
    let newWeights = [...grossWeights];
  
    if (newBoxCount > boxCount) {
      newWeights.push(undefined);
    }
  
    if (newBoxCount < boxCount) {
      newWeights.pop();
    }
  
    setGrossWeights(newWeights);

  }

  function updateBinIds(newBoxCount) {
    let newBinIds = [...binIds];
  
    if (newBoxCount > boxCount) {
      newBinIds.push(undefined);
    }
  
    if (newBoxCount < boxCount) {
      newBinIds.pop();
    }
  
    setBinIds(newBinIds);
    console.log(bins)
    
  }

  function validateComments(comments) {
    return typeof comments === 'string' && comments.trim().length > 0;
  }

  function validateNumber(value) {
    console.log()
    return typeof value === 'integer' || typeof value == 'float';
  }





  let { sendJsonMessage } = useMQTTControl()

  // let { product: c_product, batch: c_batch, expires: c_expires, quantity: c_quantity } = useMQTTState()

  const onSubmit = () => {
    if (supplier && totalNetWeight && variety && customer && handpicked && grapeCode && fruitCondition && mog && totalNetWeight && tare && bins && totalGrossWeight && user ) {
      sendJsonMessage("delivery_details/" + config.id, 
                      { id: config.id,
                        supplier: supplier,
                        variety: variety,
                        customer: customer,
                        handpicked: handpicked,
                        grapeCode: grapeCode,
                        fruitCondition: fruitCondition,
                        mog: mog,
                        comments: comments, 
                        totalNetWeight: totalNetWeight,
                        tare: tare,
                        bins: bins, 
                        totalGrossWeight: totalGrossWeight,
                        totalNetWeight: totalNetWeight, 
                        user: user,
                      }, 1, true);
      setSupplier("");
      setVariety(""); 
      setCustomer("");
      setBoxCount(1);
      setgrapeCode("");
      setFruitCondition("");
      setMog("");
      setComments("");
      setGrossWeights([""]);
      setTare(0);
      setBinIds([""]);
      setUser("");
      setHandpicked("");  
      console.log(binIds)
      console.log(boxCount)
    
    } else {
      alert("Please fill out all fields")
      console.log(supplier, totalNetWeight, variety, customer, handpicked, grapeCode, fruitCondition, mog, comments, totalNetWeight, tare, bins, totalGrossWeight, totalNetWeight, user)
    }
  }

  const onAutoFill = () => {
    setSupplier("GrapesRUs");
    setVariety("Variety 1"); 
    setCustomer("Customer 1");
    setBoxCount(1);
    setgrapeCode("Grape Code 1");
    setFruitCondition("P");
    setMog("5");
    setComments("Looking Good!");
    setGrossWeights(["150"]);
    setTare(99);
    setBinIds(["1"]);
    setUser("JM");
    setHandpicked("True");  

  }

  
  


  return <Card className='my-2'>
    <Card.Header><h4> Delivery Details: </h4></Card.Header>
    <Card.Body>


      <Form noValidate validated={true}>

      <InputGroup className="mb-3">
      <InputGroup.Text style={{ width: "10em" }}><i className='bi bi-truck me-1' />Supplier</InputGroup.Text>          
      <Form.Select 
            value={supplier}
            onChange={(event) => setSupplier(event.target.value)}
            required
            isValid={!!supplier}>
            <option value=""> Select Supplier </option>
            {suggestedSuppliers.map((i) => (
              <option>
                {i}
              </option>
            ))}
          </Form.Select>
        </InputGroup>

        {/* <InputGroup className="mb-3">
          <InputGroup.Text style={{ width: "10em" }}><i className='bi bi-truck me-1' />Supplier</InputGroup.Text>
          <Form.Control
            placeholder="Supplier Name"
            value={supplier}
            onChange={(event) => setSupplier(event.target.value)}
            required
            isValid={!!supplier}
          />
        </InputGroup> */}

        <InputGroup className="mb-3">
          <InputGroup.Text style={{ width: "10em" }}><i className='bi bi-circle-square me-1' />Variety</InputGroup.Text>
          <Form.Control
            placeholder="Grape Variety"
            value={variety}
            onChange={(event) => setVariety(event.target.value)}
            required
            isValid={!!variety}
          />
        </InputGroup>

        <InputGroup className="mb-3">
          <InputGroup.Text style={{ width: "10em" }} ><i className='bi bi-123 me-1' />Grape Code</InputGroup.Text>
          <Form.Control
            placeholder="Grape Code"
            value={grapeCode}
            onChange={(event) => setgrapeCode(event.target.value)}
            required
            isValid={!!grapeCode}
          />
        </InputGroup>

        <InputGroup className="mb-3">
          <InputGroup.Text style={{ width: "10em" }}><i className='bi bi-person-circle me-1' />Customer</InputGroup.Text>
          <Form.Control
            placeholder="Customer Code"
            value={customer}
            onChange={(event) => setCustomer(event.target.value)}
            required
            isValid={!!customer}
          />
        </InputGroup>

        <InputGroup className="mb-3">
        <InputGroup.Text style={{ width: "10em" }}><i className='bi bi-search-heart me-1' />Fruit Condition</InputGroup.Text>
          <Form.Select 
            value={fruitCondition}
            onChange={(event) => setFruitCondition(event.target.value)}
            required
            isValid={!!fruitCondition}>
            <option value="">Select Fruit Condition</option>
            <option>P</option>
            <option>A</option>
            <option>G</option>

          </Form.Select>
          <Form.Select 
            aria-label="Default select example"
            value={handpicked}
            onChange={(event) => setHandpicked(event.target.value)}
            required
            >
              <option value="" >Select</option>
              <option value='True'>Hand Picked</option>
              <option value='False'>Not Hand Picked</option>
            </Form.Select>
          
        </InputGroup>


        <InputGroup className="mb-3">
        <InputGroup.Text style={{ width: "10em" }}><i className='bi bi-flower1 me-1' />MOG Level</InputGroup.Text>
          <Form.Select 
            value={mog}
            onChange={(event) => setMog(event.target.value)}
            required
            isValid={!!mog}>
            <option value="">Select MOG Level</option>
            {mogOptions}
            
          </Form.Select>
          
        </InputGroup>

        <InputGroup className="mb-3">
          <InputGroup.Text style={{ width: "10em" }} ><i className='bi bi-chat-square-text me-1' />Comments</InputGroup.Text>
          <Form.Control
            placeholder="Comments..."
            as="textarea" 
            aria-label="With textarea"
            value={comments}
            onChange={(event) => setComments(event.target.value)}
            isValid={!!comments}
          />
        </InputGroup>

        <InputGroup className="mb-3">
        <InputGroup.Text style={{ width: "10em" }}><i className='bi bi-person-circle me-1' />User</InputGroup.Text>
          <Form.Select 
            value={user}
            onChange={(event) => setUser(event.target.value)}
            required
            isValid={!!user}>
            <option value=""> Select Initials </option>
            {suggestedUsers.map((i) => (
              <option>
                {i}
              </option>
            ))}
          </Form.Select>
        </InputGroup>

        <Form.Label column="lg" lg={2}> Weights: </Form.Label>
        <InputGroup className="mb-3">
            <InputGroup.Text style={{ width: "10em" }} ><i className='bi bi-bag-plus me-1' />Tare</InputGroup.Text>
            <Form.Select 
              aria-label="Default select example"
              required
              value={tare}
              onChange={(event) => setTare(event.target.value)}
              >
                <option value = "" >Select Tare Weight</option>
                <option >99</option>
                <option >25</option>
            </Form.Select>
        </InputGroup>
       
              
        
        {[...Array(boxCount)].map((_, i) => (
          <InputGroup className="mb-3">
            <Form.Control 
              placeholder= "Bin Number"
              value={binIds[i]}
              required
              onChange={(event) => {
                let newBinIds = [...binIds];
                newBinIds[i] = event.target.value;
                setBinIds(newBinIds);
              }}
              />
            <Form.Control 
              placeholder= "Gross Weight (kg)"
              value={grossWeights[i]}
              required
              isInvalid={!validateNumber(grossWeights[i])}
              onChange={(event) => {
                let newGrossWeights = [...grossWeights];
                newGrossWeights[i] = Number(event.target.value.replace(/\D/, ''));
                setGrossWeights(newGrossWeights);
              }}
              />
            <Button disabled = {i+1<boxCount} variant="outline-secondary" onClick={handleClick}>+</Button>
            <Button disabled = {i+1<boxCount || i==0} variant="outline-secondary" onClick={handleNegClick}>-</Button>
              
          
          </InputGroup>
        ))}

        

    
        <Card.Subtitle className="mb-2 text-muted">Bins: {boxCount}, Gross Weight: {totalGrossWeight} kg, Net Weight: {totalNetWeight} kg </Card.Subtitle>



        {/* <div className="sigBox">
          <Form.Label column="lg" lg={2}> Sign Here: </Form.Label>

          <SignatureCanvas 
              penColor='green'
              canvasProps={{
                width: 500,
                height: 200, 
                className: 'sigCanvas'}} />

        </div> */}

        <Button className='float-end' onClick={onSubmit}>Submit</Button>
        {/* <Button className='float-end' onClick={onAutoFill}>AutoFill</Button> */}



      </Form>
    </Card.Body>
  </Card>
}

export default App;
