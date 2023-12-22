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
  
  const [boxCount, setBoxCount] = React.useState(1);
  let [suggestedSuppliers, setSuggestedSuppliers] = React.useState([])
  let [suggestedUsers, setSuggestedUsers] = React.useState([])
  let [suggestedProducts, setSuggestedProducts] = React.useState([])
  let [user, setUser] = React.useState("")
  let [loaded1, setLoaded1] = React.useState(false)
  let [loaded2, setLoaded2] = React.useState(false)
  let [pending1, setPending1] = React.useState(false)
  let [pending2, setPending2] = React.useState(false)
  let keysList = ["grower", "product", "count"];
  let [palletInputsArray, setPalletInputsArray] = React.useState([])



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
        let response = await APIBackend.api_get('http://' + document.location.host + ':8001/deliveries/products');
        if (response.status === 200) {
          const raw_products = response.payload;
          console.log("products:", raw_products)
          setSuggestedProducts(raw_products.map(item => item.product))
          // setConfig(raw_conf)
          // setLoaded(true)
        } else {
          console.log("ERROR LOADING PRODUCTS")
        }
      } catch (err) {
        console.err(err);
      }
    }
    if (!loaded1  && !pending1) {
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

  React.useEffect(() => {
    console.log(palletInputsArray)
  }, [palletInputsArray])
 


  const mogOptions = [];
  for(let i = 1; i <= 10; i++) {
    mogOptions.push(<option key={i} value={i}> {i}</option>);
  }
  

  const handleClick = () => {
    setBoxCount(boxCount + 1);
    updatePalletInputs(boxCount + 1);

  };
  const handleNegClick = () => {
    setBoxCount(boxCount - 1);
    updatePalletInputs(boxCount - 1);
  };

  function updatePalletInputs(newBoxCount) {
    let newPalletInputs = [...palletInputsArray];
  
    if (newBoxCount > boxCount) {
      newPalletInputs.push(undefined);
    }
  
    if (newBoxCount < boxCount) {
      newPalletInputs.pop();
    }
  
    setPalletInputsArray(newPalletInputs);

  }

  



  function validateItemArray() {
    console.log("*** Validating Item Array ***");
    let valid = true;
    if (palletInputsArray.length === 0) {valid = false;}
    palletInputsArray.forEach((_, index) => {
      let itemKeys = Object.keys(palletInputsArray[index]);
      if (itemKeys.length !== keysList.length) {valid = false;}
      itemKeys.forEach((key) => {if (palletInputsArray[index][key] === undefined || palletInputsArray[index][key] === "") {valid = false;}});
    });
    return valid;
  }
  

  let { sendJsonMessage } = useMQTTControl()

  const onSubmit = () => {
    if (palletInputsArray && user && validateItemArray()) {
      sendJsonMessage("delivery_details/" + config.id, 
                      { id: config.id,
                        items: palletInputsArray,
                        user: user,
                      }, 1, true);
      
      setBoxCount(1);
      setUser("");  
      setPalletInputsArray([]);
      console.log("*** Reset Form ***")
    
    } else {
      alert("Please fill out all fields")
    }
  }


  return <Card className='my-2'>
    <Card.Header><h4> Pallet Details: </h4></Card.Header>
    <Card.Body>


      <Form noValidate validated={true}>

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

        
       
              
        
        

        {[...Array(boxCount)].map((_, i) => (
          <InputGroup className="mb-3">
            <Form.Select 
              placeholder= "Grower"
              value={palletInputsArray[i] && palletInputsArray[i].grower ? palletInputsArray[i].grower : ''}
              required
              onChange={e => {
                let newArray = [...palletInputsArray];
                newArray[i] = {...newArray[i], grower: e.target.value};
                setPalletInputsArray(newArray);
              }}>
              <option value=""> Select Grower </option>
              {suggestedSuppliers.map((i) => (
                <option>
                  {i}
                </option>
              ))}
            </Form.Select>


            <Form.Select 
              placeholder= "Product"
              value={palletInputsArray[i] && palletInputsArray[i].product ? palletInputsArray[i].product : ''}
              required
              onChange={e => {
                let newArray = [...palletInputsArray];
                newArray[i] = {...newArray[i], product: e.target.value};
                setPalletInputsArray(newArray);
              }}
              >
              <option value=""> Select Product </option>
              {suggestedProducts.map((i) => (
                <option>
                  {i}
                </option>
              ))}
            </Form.Select>

            <Form.Control 
              placeholder= "Count"
              value={palletInputsArray[i] && palletInputsArray[i].count ? palletInputsArray[i].count : ''}
              required
              type="number"
              onChange={e => {
                let newArray = [...palletInputsArray];
                newArray[i] = {...newArray[i], count: e.target.value};
                setPalletInputsArray(newArray);
              }}
              />
          
            <Button disabled={i+1<boxCount} variant="outline-secondary" onClick={handleClick}>+</Button>
            <Button disabled={i+1<boxCount || i==0} variant="outline-secondary" onClick={handleNegClick}>-</Button>
              
          </InputGroup>
        ))}



        

    
        {/* <Card.Subtitle className="mb-2 text-muted">Bins: {boxCount}, Gross Weight: {totalGrossWeight} kg, Net Weight: {totalNetWeight} kg </Card.Subtitle> */}



        

        <Button className='float-end' onClick={onSubmit}>Submit</Button>

      </Form>
    </Card.Body>
  </Card>
}

export default App;
