import 'bootstrap/dist/css/bootstrap.css';
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
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
import { Form, InputGroup, ListGroup, Nav, Navbar, Table } from 'react-bootstrap';
import { ToastProvider, add_toast, useToastDispatch } from './ToastContext'
import { BrowserRouter, Routes, Route, NavLink, Outlet, useParams } from 'react-router-dom'
import { PaginateWidget, groupBy, paginate, pivot } from './table_utils';
import { SettingsPage } from './settings';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";



function App() {
  let [loaded, setLoaded] = React.useState(false)
  let [pending, setPending] = React.useState(false)
  let [error, setError] = React.useState(null)

  let [config, setConfig] = React.useState([])

  React.useEffect(() => {
    let do_load = async () => {
      setPending(true)
      APIBackend.api_get('http://' + document.location.host + '/config/config.json').then((response) => {
        if (response.status === 200) {
          const raw_conf = response.payload;
          console.log("config", raw_conf)
          setConfig(raw_conf)
          setLoaded(true)
        } else {
          console.log("ERROR LOADING CONFIG")
          setError("ERROR: Unable to load configuration!")
        }
      }).catch((err) => {
        console.error(err.message);
        setError("ERROR: Unable to load configuration!")
      })
    }
    if (!loaded && !pending) {
      do_load()
    }
  }, [loaded, pending])

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
        subscriptions={["location_state/update"]}
        new_message_action={custom_new_message_action}
        reducer={CustomReducer}
        initial_state={{ items_state: [] }}
        debug={true}
      >
        <ToastProvider position='bottom-end'>
          <BrowserRouter>
            <Routing config={config} />
          </BrowserRouter>
        </ToastProvider>
      </MQTTProvider>
    )
  }
}


function Routing(props) {
  let [result, setResult] = React.useState([])
  let [location_list, setLocationList] = React.useState([])
  let [shown_locations, setShownLocations] = React.useState([])
  let [shown_locs_set, setShownLocsSet] = React.useState(false)
  let [page_size, setPageSize] = React.useState(5)
  let [storageLoaded, setStorageLoaded] = React.useState(false)
  let [date, setDate] = React.useState(new Date())
  let [grower_list, setGrowerList] = React.useState([])
  let [product_list, setProductList] = React.useState([])

  function UpdateResults(result) {
    let grower_list = []
    let product_list = []
    result.forEach(item => {
      if (!grower_list.includes(item['grower'])) {
        grower_list.push(item['grower'])
      }
      if (!product_list.includes(item['product'])) {
       product_list.push(item['product'])
      }
    })
    setGrowerList(grower_list)
    setProductList(product_list)
    setResult(result)
  }


  return (
    <Routes>
      <Route path='/' element={<Base  date={date} setDate={setDate} setResult={setResult} UpdateResults={UpdateResults} {...props} />}>
        {/* <Route path='/settings' element={<SettingsPage location_list={location_list} config={props.config} shown_locations={shown_locations} setShownLocations={setShownLocations} page_size={page_size} setPageSize={setPageSize} />} /> */}
        <Route index element={<Dashboard date={date} setDate={setDate} result={result} grower_list={grower_list} product_list={product_list} />}></Route>
      </Route>
    </Routes>
  )
}


function Base({ date, setDate, setResult, config, UpdateResults }) {
  let [loaded, setLoaded] = React.useState(false)
  let [pending, setPending] = React.useState(false)
  let [error, setError] = React.useState(null)

  React.useEffect(() => {
    console.log("Query Date: * ", date, typeof(date))
    setLoaded(false)
    setPending(false)
  }, [date])

  React.useEffect(() => {
    let do_load = async () => {
      setPending(true)
      let url = (config.api.host ? config.api.host : window.location.hostname) + (config.api.port ? ":" + config.db.port : "")
      APIBackend.api_get('http://' + url + '/deliveries/packout/' + date.toISOString().slice(0, 10)).then((response) => {
        if (response.status === 200) {
          console.log(response.payload)
          console.log("Type: ", typeof (response.payload))
          // setLocationList(response.payload)
          UpdateResults(response.payload)
          setLoaded(true)
        } else {
          console.error("Unable to load products")
          setError("Unable to load list of products - please try refresh")
        }
      }).catch((err) => {
        console.error(err.message);
        setError("ERROR: Unable to load daily packout!")
      })
    }
    if (!loaded && !pending) {
      do_load()
    }
  }, [loaded, pending, config])

  if (!loaded) {
    return <Container fluid="md">
      <Card className='mt-2 text-center'>
        {error !== null ? <h1>{error}</h1> : <div><Spinner></Spinner> <h2 className='d-inline'>Loading...</h2></div>}
      </Card>
    </Container>
  } else {
    return (
      <Container fluid className="p-0 d-flex flex-column">
        {/* <div id='header'> */}
        <Navbar sticky="top" bg="secondary" variant="dark" expand="md">
          <Container fluid>
            <Navbar.Brand href="/">
              Daily Packout
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" className='mb-2' />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav variant="pills" className="me-auto">
                <BSNavLink to='/'>Dashboard</BSNavLink>
                <BSNavLink to='/settings'>Settings</BSNavLink>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        {/* </div> */}
        <Container fluid className="flex-grow-1 main-background px-1 pt-2 px-sm-2">
          <Outlet />
        </Container>
      </Container>
    )
  }
}

function BSNavLink({ children, className, ...props }) {
  return <NavLink className={({ isActive }) => (isActive ? ("nav-link active " + className) : ("nav-link " + className))} {...props}>{children}</NavLink>
}

function Dashboard({ config = {}, result, setDate, date, grower_list, product_list}) {
  const { sendJsonMessage } = useMQTTControl()
  let toast_dispatch = useToastDispatch()
  let dispatch = useMQTTDispatch()
  let { connected, items_state } = useMQTTState()

  // let [items_loaded, setItemsLoaded] = React.useState(false)
  // let [items_pending, setItemsPending] = React.useState(false)
  // let [items_error, setItemsError] = React.useState(undefined)
  // let [items_reload, setItemsReload] = React.useState(undefined)

  let variant = "danger"
  let text = "Disconnected"
  if (connected) {
    variant = "success"
    text = "Connected"
  }

  // React.useEffect(() => {
  //   let do_load = async () => {
  //     console.log("Loading items")
  //     setItemsLoaded(false);
  //     setItemsPending(true);
  //     setItemsReload(false);

  //     let url = (config.db.host ? config.db.host : window.location.hostname) + (config.db.port ? ":" + config.db.port : "")
  //     console.log(url)
  //     APIBackend.api_get('http://' + url + '/state/').then((response) => {
  //       if (response.status === 200) {
  //         setItemsLoaded(true)
  //         dispatch({ type: 'SET_ITEMS', item: response.payload })
  //         setItemsError(false)
  //       } else {
  //         console.log("ERROR LOADING ITEMS")
  //         dispatch({ type: 'SET_ITEMS', item: null })
  //         setItemsError(true)
  //       }
  //     }).catch((err) => {
  //       console.error(err.message);
  //       setItemsError("ERROR: Unable to load items list!")
  //     })
  //   }
  //   if ((!items_loaded && !items_pending) | items_reload) {
  //     do_load()
  //   }
  // }, [config.api, config.db, dispatch, items_loaded, items_pending, items_reload])

  return (
    <Container fluid className="p-0 d-flex flex-column">
      <Container fluid className="flex-grow-1 p-0 ">
        <Card className='my-2'>
          <Card.Header><h4>Daily Packout:</h4></Card.Header>
          <Card.Body>
            <DatePicker
                selected={date}
                onChange={date => setDate(date)}
                dateFormat="yyyy-MM-dd"
              />
            <ItemTable result={result} product_list={product_list} grower_list={grower_list}/>
          </Card.Body>
        </Card>
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

function ItemTable({ result, grower_list, product_list}) {
  let [loaded, setLoaded] = React.useState(false)
  let [pending, setPending] = React.useState(false)
  let [error, setError] = React.useState(null)
  let [itemNames, setItemNames] = React.useState({})
  


  return <>
    <Table bordered striped responsive="sm">
      <thead>
        <tr>
          <th key='grower' colSpan={1}><h3>Grower</h3></th>
          {product_list ? product_list.map((item, index) => (
            <th key={item} colSpan={1}><h3>{item}</h3></th>
          )): null}
          <th key='total' colSpan={1}><h3>Total</h3></th>

        </tr>
      </thead>
      <tbody>
        {grower_list ? grower_list.map((grower, growerIndex) => (
            <tr key={grower}>
                <td key={grower}> {grower} </td>
                {product_list ? product_list.map((product, productIndex) => {
                    try{
                      const item = result.find(item => item.grower === grower && item.product === product);
                      return (
                          <td key={`${grower}-${product}`}>
                              {item ? item.total_quantity : ''}
                          </td>
                      );}
                    catch(e){};
                }) : null}
                <td>
                    {result ? result.reduce((acc, elem) => {
                        return elem.grower === grower ? acc + elem.total_quantity : acc
                    }, 0) : null}
                </td>
            </tr>
        )) : null}
        <tr key='total'>
            <td style={{fontWeight: 'bold'}} key='total'>Total</td>
            {product_list ? product_list.map((product, productIndex) => {
                try{
                  const items = result.filter(item => item.product === product);
                  const total = items.reduce((acc, elem) => {
                      return acc + elem.total_quantity
                  }, 0);

                  return (
                      <td style={{fontWeight: 'bold'}} key={`${product}`}>
                          {total ? total : ''}
                      </td>
                  );}
                catch(e){};
            }) : null}
            <td style={{fontWeight: 'bold'}}>
                {result ? result.reduce((acc, elem) => {
                    return acc + elem.total_quantity
                }, 0) : null}
            </td>
        </tr>
    </tbody>



    </Table>
  </>

}

export default App;
