import React, {Component} from 'react';

class Timer extends Component<State> {

    state = {
        elapsedTime: 0,
        initTime: 0,
        running: false
    };

    constructor(props) {
        super(props);
        this.start = this.start.bind(this);
        this.reset = this.reset.bind(this);
    }

    /**
     *  This method gets called when the start button gets clicked and begins
     *  the timer. 
     */
    start() {
        this.setState(state => {
            if(state.running) {
                clearInterval(this.timer);
            } else {
            const initTime = Date.now() - this.state.elapsedTime;
            this.timer = setInterval(() =>  {
                this.setState({elapsedTime: Date.now() - initTime});
            });
            }
       });
       let isRunning = this.state.running;
       this.setState({running: !isRunning});
    }

    /**
     * Reset the timer to 0
     */
    reset() {
        clearInterval(this.timer);
        this.setState({elapsedTime: 0, initTime: 0, running: false});
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    render() {
        const {elapsedTime, running, initTime} = this.state;
        console.log("elapsed time: " + elapsedTime);
        let sec = Math.floor(elapsedTime / 1000).toString();
        let displaySec = Math.floor(sec % 60).toString();
        let min = Math.floor(elapsedTime /60000).toString();
    
        return( 
        <div id="timer-wrapper">
            <p>{min}m: {displaySec}s</p>
            <button id="timer-start-button" className="timer-button" onClick={this.start}>{running?  "Stop" :"Start"}</button>
            <button id="timer-reset-button" className="timer-button" onClick={this.reset}> Reset</button>
        </div>
        );

    }
} export default Timer;