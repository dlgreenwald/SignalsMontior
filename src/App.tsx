import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import MetricsGraphics from 'react-metrics-graphics';
import LoginModal from './LoginModal';
import 'metrics-graphics/dist/metricsgraphics.css';
import {ThermoworksFirebase} from './ThermoworksFirebase';
import 'jquery';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import TempColumn from './TempColumn';

interface MyProps {

};
interface MyState {
  firebase: ThermoworksFirebase
  tempData:Array<Array<{ 'date': Date; 'value': number; }>>;
  curTemps:Map<string, { 'date': Date; 'value': number; }>;
  probeDetails:Map<string, { "temp":string, "date":Date, "alarm":boolean, "alarmHigh":string, "alarmLow":string, "max":string, "min":string, "name":string}>;
};
class App extends Component<{}, MyState> {
  constructor(state:MyProps){
    super(state);

    this.state = {
      firebase: new ThermoworksFirebase(),
      tempData:  [],
      curTemps: new Map(),
      probeDetails: new Map()
    };
  }


  async onLogin(username:string, password:string){
    this.state.firebase.setCredentials(username, password);
    this.state.firebase.setOnTempUpdate(this.onTempUpdate.bind(this));
    await this.state.firebase.init();
  }

  onTempUpdate(){
    //Store most recent data as Map for display
    var newCurTemps:Map<string, { 'date': Date; 'value': number; }> = new Map();
    this.state.firebase.returnTempData().forEach((probe, key)=>{
      newCurTemps.set(key, probe[probe.length-1]);
    })

    //Store all data as Array of Arrays for graph
    var newTemps:Array<Array<{ 'date': Date; 'value': number; }>>=[];
    this.state.firebase.returnTempData().forEach((probe)=>{
      newTemps.push(probe);
    })

    var newProbeDetails = this.state.firebase.returnProbeDetails();

    this.setState({...this.state, 
      tempData:newTemps, curTemps:newCurTemps, probeDetails:newProbeDetails
    });
  }

  

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <Container fluid >
          <Row>
            <Col md="10">          
              <MetricsGraphics
                title="Temperature over Time"
                description="This graphic shows a time-series of temperature."
                data={ this.state.tempData }
                full_width="true"
                height={600}
                x_accessor="date"
                y_accessor="value"
                right="40"
                area="false"
                brush="xy"
              />
            </Col>
            <Col md="2">
                <TempColumn curTemps={this.state.curTemps} probeDetails={this.state.probeDetails}/>
            </Col>
          </Row>
          </Container>

          <LoginModal onLogin={this.onLogin.bind(this)}/>

        </header>
      </div>
    );
  }

}

export default App;
