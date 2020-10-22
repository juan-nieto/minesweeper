import React, {Component} from 'react';
import './App.css';
import Gameboard from './App.js';


type Props = {
  row: number,
  column: number,
  state: String,
  mine: Boolean,
  count: number,
  clickedCell: Function,
  rightClickedCell: Function
};

type State = {
  clicked: Boolean,
  flag: Boolean
}
// private constants
const privateConstantMap = {
  STATE_HIDDEN: "hidden",
  STATE_SHOWN: "shown",
  STATE_MARKED: "marked"
};

class GameCell extends Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = { clicked: false, flag: false };
    this.handleCellClicked = this.handleCellClicked.bind(this);
    this.handleRightClick = this.handleRightClick.bind(this);
  }

  /**
   * 
   */
  handleCellClicked({ target }: SyntheticMouseEvent<>) {
    let {row, column, state, mine, count, clickedCell} = this.props;
    let {clicked, flag} = this.state;
    console.log("I was clicked in r,c:" + row + "," + column);
    //If there is no flag on this cell, set clicked to true
    if(!flag) {
      //clicked = true;
      this.setState({clicked: true});
    }
    
    if(typeof state !== 'undefined') {
      if(state !== privateConstantMap.STATE_HIDDEN) {
        console.log("This cell is already shown, set as clicked");
        clicked = true;
        this.setState({clicked: true});
        //return;
      }
    }
    
    //If it hasn't been clicked before, call uncover method from Gameboard
    console.log("clicked state is: " + this.state.clicked + " clicked var is: " + clicked);
    if(!clicked) {
      clickedCell(row, column);
    }

  }

  handleRightClick(e: SyntheticMouseEvent<>) {
    e.preventDefault();
    let {row, column, rightClickedCell, state} = this.props;
    let {clicked, flag} = this.state;
    if(!clicked) {
      if(state !== privateConstantMap.STATE_SHOWN) {
        if(flag) {
          this.setState({flag: false});
        } else {
          this.setState({flag: true});
        }
        rightClickedCell(row, column);
      }
    }
  }

  render() {
    let {row, column, state, mine, count, clickedCell, rightClickedCell} = this.props;
    let {flag} = this.state;
    const flagClass = (flag && state === privateConstantMap.STATE_HIDDEN) ? 'marked' : ''
    const mineClass =  mine ? 'mine' : ''
    const countClass = count.toString();
    //const stateClass = (state=== 'hidden') ? ''
    return(
      <td id={`${row}_${column}`}
        className={`${mineClass} ${flagClass} ${state} _${countClass}`}
        onClick={this.handleCellClicked.bind(this)}
        onContextMenu={this.handleRightClick.bind(this)}
        >
      </td>
    );
  }


} export default GameCell;
