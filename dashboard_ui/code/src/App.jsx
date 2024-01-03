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


  

  React.useEffect(() => {
    if (localStorage.getItem('shown_locations')) {
      setShownLocations(JSON.parse(localStorage.getItem('shown_locations')))
      console.log("shown set to storage")
      setShownLocsSet(true)
    }

    if (localStorage.getItem('page_size')) {
      let value = JSON.parse(localStorage.getItem('page_size'))
      setPageSize(value)
      console.log("page size from storage",value)
    }
    setStorageLoaded(true)
  }, [])

  React.useEffect(() => {
    if (!shown_locs_set) {

      if (props.config.shown_locations) {
        if (props.config.shown_locations === "*") {
          if (location_list.length > 0) {
            setShownLocations(location_list.map(elem => elem.id))
            console.log("shown set to all")
            setShownLocsSet(true)
          }
        } else if (props.config.shown_locations) {
          setShownLocations(props.config.shown_locations)
          console.log("shown set to config")
          setShownLocsSet(true)
        }
      }
    }
  }, [location_list, props.config, shown_locs_set])

  React.useEffect(() => {
    if (storageLoaded && shown_locations.length > 0) {
      console.log("Saving shown ", shown_locations)
      localStorage.setItem('shown_locations', JSON.stringify(shown_locations));
    }
  }, [shown_locations, storageLoaded])

  React.useEffect(() => {
    if (storageLoaded) {
      console.log("Saving page_size ", page_size)
      localStorage.setItem('page_size', JSON.stringify(page_size));
    }
  }, [page_size, storageLoaded])

  return (
    <Routes>
      <Route path='/' element={<Base  date={date} setDate={setDate} location_list={location_list} setLocationList={setLocationList} setResult={setResult} {...props} />}>
        <Route path='/settings' element={<SettingsPage location_list={location_list} config={props.config} shown_locations={shown_locations} setShownLocations={setShownLocations} page_size={page_size} setPageSize={setPageSize} />} />
        {/* <Route path='/loc/:location_id' element={<Dashboard location_list={location_list} config={props.config} />} /> */}
        <Route index element={<Dashboard date={date} setDate={setDate} result={result} location_list={location_list} config={props.config} shown_locations={shown_locations} settings_page_size={page_size} />}></Route>
      </Route>
    </Routes>
  )
}


function Base({ date, setDate, setResult, setLocationList, config }) {
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
          setResult(response.payload)
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
  }, [loaded, pending, config, setLocationList])

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

function Dashboard({ config = {}, result, location_list, shown_locations, settings_page_size, setDate, date }) {
  const { sendJsonMessage } = useMQTTControl()
  let toast_dispatch = useToastDispatch()
  let dispatch = useMQTTDispatch()
  let { connected, items_state } = useMQTTState()

  let [items_loaded, setItemsLoaded] = React.useState(false)
  let [items_pending, setItemsPending] = React.useState(false)
  let [items_error, setItemsError] = React.useState(undefined)
  let [items_reload, setItemsReload] = React.useState(undefined)

  let variant = "danger"
  let text = "Disconnected"
  if (connected) {
    variant = "success"
    text = "Connected"
  }

  React.useEffect(() => {
    let do_load = async () => {
      console.log("Loading items")
      setItemsLoaded(false);
      setItemsPending(true);
      setItemsReload(false);

      let url = (config.db.host ? config.db.host : window.location.hostname) + (config.db.port ? ":" + config.db.port : "")
      console.log(url)
      APIBackend.api_get('http://' + url + '/state/').then((response) => {
        if (response.status === 200) {
          setItemsLoaded(true)
          dispatch({ type: 'SET_ITEMS', item: response.payload })
          setItemsError(false)
        } else {
          console.log("ERROR LOADING ITEMS")
          dispatch({ type: 'SET_ITEMS', item: null })
          setItemsError(true)
        }
      }).catch((err) => {
        console.error(err.message);
        setItemsError("ERROR: Unable to load items list!")
      })
    }
    if ((!items_loaded && !items_pending) | items_reload) {
      do_load()
    }
  }, [config.api, config.db, dispatch, items_loaded, items_pending, items_reload])

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
            <ItemTable result={result} state={items_state} shown_locations={shown_locations} location_list={location_list} config={config} settings_page_size={settings_page_size} />
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

function ItemTable({ result, state, location_list, shown_locations = [], config, settings_page_size }) {
  let [loaded, setLoaded] = React.useState(false)
  let [pending, setPending] = React.useState(false)
  let [error, setError] = React.useState(null)
  let [itemNames, setItemNames] = React.useState({})

  return <>
    <Table bordered striped responsive="sm">
      <thead>
        <tr>
          {result ? result.map((item, index) => (
            <th key={item['product']} colSpan={1}><h3>{item['product']}</h3></th>
          )): null}
          <th key='total' colSpan={1}><h3>Total</h3></th>

        </tr>
      </thead>
      <tbody>
          <tr>
            {result ? result.map((item, index) => (
              <td>{item['total_quantity']}</td>
            )) : null}
            <td>{result ? result.reduce((acc, elem) => { return acc + elem['total_quantity'] }, 0) : null}</td>
          </tr>
      </tbody>
    </Table>
  </>

}

export default App;
