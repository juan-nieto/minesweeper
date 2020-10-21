import React, {Component} from 'react';

class Timer extends Component<State> {

    constructor(props) {
        super(props);
        this.state = this.initialState = {
            elapsedTime: 0,
            initTime: 0
        };
        this.start = this.start.bind(this);
    }

    /**
     *  This method gets called when the start button gets clicked and begins
     *  the timer. 
     */
    start() {
        this.setState(state => {
            const initTime = Date.now() - this.state.elapsedTime;
            this.timer = setInterval(() =>  {
                this.setState({elapsedTime: Date.now() - initTime});
            });
       });
    }

    render() {
        const totalSeconds = this.state.elapsedTime;
        const sec = Math.floor(totalSeconds / 1000).toString();
        const displaySec = Math.floor(sec % 60).toString();
        const min = Math.floor(totalSeconds /60000).toString();
    
        return( 
        <div id="timer-wrapper">
            <p>{min}m:{displaySec}s</p>
            <button id="timer-start-button" className="timer-button" onClick={this.start}> Start</button>
        </div>
        );

    }
} export default Timer;