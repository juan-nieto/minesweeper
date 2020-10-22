import React, {Component} from 'react';
import './App.css';
import GameCell from './GameCell';
import Timer from './Timer'
import { useState } from 'react';

class App extends React.Component{

  state = {
    isHardMode: false
  }
  constructor(props){
    super(props);
    this.handleToggleClick = this.handleToggleClick.bind(this);
  }

  handleToggleClick() {
   // let isHardmode = this.state.isHardMode;
    if(this.state.isHardMode) {
      console.log("Setting state: " + this.state.isHardMode);
      this.setState({isHardMode: false});
    } else {
      console.log("Else Setting state: " + this.state.isHardMode);
      this.setState({isHardMode: true});
    }
  }
  
  render() {
    let {isHardMode} = this.state;
    let col, row, mines;

    if(!isHardMode) {
      console.log("Creating minesweeper with difficulty mode: " + isHardMode);
      col = 10;
      row = 10;
      mines = 8;
    } else {
      console.log("Creating minesweeper with difficulty mode: " + isHardMode);
      col = 18;
      row = 18;
      mines = 40;
    }

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="title-minesweeper">Minesweeper</h1>
        <Timer/>       
        <Gameboard key={isHardMode} isEasy={isHardMode} totRows={row} totColumns={col} totMines={mines}/>
        
        <button id="toggle-difficuly-button" className="difficulty-button"
          onClick={this.handleToggleClick}  > {isHardMode? 'Hard Mode' : 'Easy Mode'}
        </button>      
        <p>Remaining mines: {mines}</p>
      </header>
    </div>
  );
}
} export default App;


// private constants
const privateConstantMap = {
  STATE_HIDDEN: "hidden",
  STATE_SHOWN: "shown",
  STATE_MARKED: "marked"
};

type Props = {
  isEasy: Boolean,
  totColumns: number,
  totRows: number,
  totMines: number,
  toggleDifficulty: Function
};
type State = {
  nCols: number,
  nRows: number,
  nMines: number,
  nmarked: number,
  nuncovered: number,
  exploded: Boolean,
  arr: Array<Array<>>
};
/**
 * Gameboard is the grid composed of a 2D array that represents
 * the minesweeper UI
 */
export class Gameboard extends Component<State, Props> {
  
  constructor(props) {
    super(props);
    let {totColumns, totRows, totMines, isEasy} = this.props;
    console.log("Constructing with totalCOlumns = " + totColumns);
    let nCols = totColumns;
    let nRows = totRows;
    let nMines = totMines;
    let nmarked = 0;
    let nuncovered = 0;
    let exploded = false;

    this.state = {
      nCols,
      nRows,
      nMines,
      nmarked,
      nuncovered,
      exploded,
      arr: this.array2d(nRows, nCols,
        () => ({mine: false, state: privateConstantMap.STATE_HIDDEN, count: 0}))
    };
    this.uncover = this.uncover.bind(this);
  }

  /**
   * 2D array representing the gameboard
   * @param {*} nrows 
   * @param {*} ncols 
   * @param {*} val 
   */
  array2d( nrows, ncols, val) {
    const res = [];
    for( let row = 0 ; row < nrows ; row ++) {
      res[row] = [];
      for( let col = 0 ; col < ncols ; col ++)
        res[row][col] = val(row,col);
    }

    return res;
  }

  // returns random integer in range [min, max]
  rndInt(min, max) {
    [min,max] = [Math.ceil(min), Math.floor(max)]
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  validCoord(row, col) {
    return row >= 0 && row < this.state.nRows && col >= 0 && col < this.state.nCols;
  }

  count(row,col) {
    const c = (r,c) =>
          (this.validCoord(r,c) && this.state.arr[r][c].mine ? 1 : 0);
    let res = 0;
    for( let dr = -1 ; dr <= 1 ; dr ++ )
      for( let dc = -1 ; dc <= 1 ; dc ++ )
        res += c(row+dr,col+dc);
    return res;
  }

  sprinkleMines(row, col) {
    // prepare a list of allowed coordinates for mine placement
    let allowed = [];
    for(let r = 0 ; r < this.state.nRows ; r ++ ) {
      for( let c = 0 ; c < this.state.nCols ; c ++ ) {
        if(Math.abs(row-r) > 2 || Math.abs(col-c) > 2)
          allowed.push([r,c]);
      }
    }
   
    this.state.nMines = Math.min(this.state.nMines, allowed.length);
    for( let i = 0 ; i < this.state.nMines ; i ++ ) {
      let j = this.rndInt(i, allowed.length-1);
      [allowed[i], allowed[j]] = [allowed[j], allowed[i]];
      let [r,c] = allowed[i];
      this.state.arr[r][c].mine = true;
      console.log("mine here: " + " r,c:" + r + "," + c + " " + this.state.arr[r][c].mine);
    }
    // erase any marks (in case user placed them) and update counts
    for(let r = 0 ; r < this.state.nRows ; r ++ ) {
      for( let c = 0 ; c < this.state.nCols ; c ++ ) {
        if(this.state.arr[r][c].state == privateConstantMap.STATE_MARKED) {
          this.state.arr[r][c].state = privateConstantMap.STATE_HIDDEN; 
        }
        this.state.arr[r][c].count = this.count(r,c);
      }
    }
    let mines = []; let counts = [];
    for(let row = 0 ; row < this.state.nRows ; row ++ ) {
      let s = "";
      for( let col = 0 ; col < this.state.nCols ; col ++ ) {
        s += this.state.arr[row][col].mine ? "B" : ".";
      }
      s += "  |  ";
      for( let col = 0 ; col < this.state.nCols ; col ++ ) {
        s += this.state.arr[row][col].count.toString();
      }
      mines[row] = s;
    }
    let gameboardArr = this.state.arr.map(function(arr) {
      return arr.slice();
    });
    this.setState({arr: gameboardArr});

    console.log("Mines and counts after sprinkling:");
    console.log(mines.join("\n"), "\n");
  }

  // uncovers a cell at a given coordinate
  // this is the 'left-click' functionality
  uncover(row, col) {
    console.log("uncover", row, col);
    // if coordinates invalid, refuse this request
    if( ! this.validCoord(row,col)) {
      console.log("Requested coordinates (" + row + ", "+ col + ") were invalid.");
      return false; 
    }
    let nuncovered = this.state.nuncovered;
    console.log("beginning uncover method with nuncovered: " + this.state.nuncovered
    + " with var: " + nuncovered);

    // if this is the very first move, populate the mines, but make
    // sure the current cell does not get a mine
    if( this.state.nuncovered === 0) {
      console.log("populating with mines at: " + row + ", " + col);
      this.sprinkleMines(row, col);
    }
    // if cell is not hidden, ignore this move
    //this.state.arr[row][col].state !== privateConstantMap.STATE_HIDDEN //prev if statement
    if( typeof this.state.arr[row][col].state !== 'undefined') {
      console.log("state of this cell is not undefined, it's: " + this.state.arr[row][col].state);
      if(this.state.arr[row][col].state !== privateConstantMap.STATE_HIDDEN) {
        return false; //STATE_HIDDEN
      }
    }
    let gameboardArr = this.state.arr.map(function(arr) {
      return arr.slice();
    });

    let uncoveredUpdated = this.state.nuncovered;
    //floodfill all 0-count cells
    const ff = (r, c, gameboardArr, uncoveredUpdated) => {
      if(!this.validCoord(r,c)) {
        return;
      }
      
      if(typeof gameboardArr[r][c].state !== 'undefined'){ 
        if(gameboardArr[r][c].state !== privateConstantMap.STATE_HIDDEN) {
          return; 
        }
      }
      gameboardArr[r][c].state = privateConstantMap.STATE_SHOWN;
      uncoveredUpdated++;
      this.state.nuncovered = uncoveredUpdated;
      this.setState({nuncovered: uncoveredUpdated}, () => {
       console.log("updated nuncovered state in ff: " + this.state.nuncovered);
      });
      
      if(gameboardArr[r][c].count !== 0) {
        return;
      }
      ff(r-1,c-1, gameboardArr, uncoveredUpdated);ff(r-1,c, gameboardArr, uncoveredUpdated);ff(r-1,c+1, gameboardArr, uncoveredUpdated);
      ff(r  ,c-1, gameboardArr, uncoveredUpdated);         ;ff(r  ,c+1, gameboardArr, uncoveredUpdated);
      ff(r+1,c-1, gameboardArr, uncoveredUpdated);ff(r+1,c, gameboardArr, uncoveredUpdated);ff(r+1,c+1, gameboardArr, uncoveredUpdated);
    };
    ff(row,col, gameboardArr, uncoveredUpdated);
  
    this.setState({arr: gameboardArr}, () => {
    });
    
    this.setState({nuncovered: this.state.nuncovered}, () => {
      console.log("updated nuncovered state AFTER ff: " + this.state.nuncovered);
    });   
    // have we hit a mine?
    let lost = false;
    if(this.state.arr[row][col].mine) {
      console.log("Mine at " + row + ", " + col + " was hit");
      this.state.exploded = true;
      lost = true;
      alert("You lost");
      window.location.reload(true);
    }
    if(!lost) {
      let totalHiddenSquares = 0;
      for(let i = 0; i < this.state.arr.length; i++) {
        for(let j = 0; j < this.state.arr.length; j++) {
          if(this.state.arr[i][j].state === privateConstantMap.STATE_HIDDEN
              || this.state.arr[i][j].state === privateConstantMap.STATE_MARKED) {
            totalHiddenSquares++;
            //console.log("Hidden Squares remaining: " + totalHiddenSquares);
          }
        }
      }
      if(totalHiddenSquares === this.state.nMines) {
        alert("You win!");
        window.location.reload(true);
      }
    }
    
    console.log("nuncovered state value: " + this.state.nuncovered + " , uncoveredUpdated temp var: " + uncoveredUpdated);
    return true;
  }

  // puts a flag on a cell
  // this is the 'right-click' or 'long-tap' functionality
  mark(row, col) {
    console.log("mark", row, col);
    // if coordinates invalid, refuse this request
    if( ! this.validCoord(row,col)){
      return false;
    }
    // if cell already uncovered, refuse this
    console.log("marking previous state=", this.state.arr[row][col].state);
    if( this.state.arr[row][col].state === privateConstantMap.STATE_SHOWN) return false; //STATE_SHOWN
    // accept the move and flip the marked status
    this.nmarked += this.state.arr[row][col].state == privateConstantMap.STATE_MARKED ? -1 : 1;
    this.state.arr[row][col].state = this.state.arr[row][col].state == privateConstantMap.STATE_MARKED ? 
    privateConstantMap.STATE_HIDDEN : privateConstantMap.STATE_MARKED; //STATE_HIDDEN:STATE_MARKED
    return true;
  }


  // returns array of strings representing the rendering of the board
  //      "H" = hidden cell - no bomb
  //      "F" = hidden cell with a mark / flag
  //      "M" = uncovered mine (game should be over now)
  // '0'..'9' = number of mines in adjacent cells
  getRendering() {
    const res = [];
    for( let row = 0 ; row < this.state.nRows ; row ++) {
      let s = "";
      for( let col = 0 ; col < this.state.nCols ; col ++ ) {
        let a = this.state.arr[row][col];
        if( this.exploded && a.mine) s += "M";
        else if( a.state === privateConstantMap.STATE_HIDDEN) s += "H"; //statehidden
        else if( a.state === privateConstantMap.STATE_MARKED) s += "F"; //state marked
        else if( a.mine) s += "M";
        else s += a.count.toString();
      }
      res[row] = s;
    }
    return res;
  }

  getStatus() {
    let done = this.state.exploded ||
        this.state.nuncovered === this.state.nRows * this.state.nCols - this.state.nMines;
    if(done) {
      alert("You win!");
    }
    return {
      done: done,
      exploded: this.state.exploded,
      nRows: this.state.nRows,
      nCols: this.state.nCols,
      nmarked: this.state.nmarked,
      nuncovered: this.state.nuncovered,
      nMines: this.state.nMines
    }
  }

  render() {
    let {isEasy} = this.props;
    return (
      <div id="gameboard-container">
        <table id="gameboard-table">
          <tbody>
            {this.state.arr.map((item, row) => {
              return(
                <tr key={row}>
                  {item.map((subitem, col) => {
                    return (
                      <GameCell 
                        key={col}
                        row={row}
                        column={col}
                        state={subitem.state}
                        mine={subitem.mine}
                        count={subitem.count}
                        clickedCell={this.uncover.bind(this)}
                        rightClickedCell={this.mark.bind(this)}
                      >
                      </GameCell>
                    );
                  }
                  )}
                </tr>
              );
            })}
          </tbody>  
        </table>   
      </div>
    );
  }
};
