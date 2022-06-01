<?php

/**
 * @author Paul Bennett 
 */

/**
 * Game of life exercise
 * Rules for cells
 * https://www.codingame.com/training/medium/game-of-life
 * 
 * Array can wrap around
 * Board is check for total death
 * User can submit arrays to compare expected results against board history
 * Submit array at bottom of page
 */


/**
 * Cell is alive or dead
 */

final class cell{
    
    protected $live = false;
    
    public function setLive($live){
        $this->live = $live;
    }
    
    public function getLive(){
        return $this->live;
    }
    
} 


/**
 * Board
 */
final class life{
    
    protected $board            = array();
    protected $board_valid      = false;
    protected $board_x_width    = 0;
    protected $board_y_height   = 0;

    protected $boardHistory     = array();
    
    
    /** 
     * Board Creation
     * Either generate a random board or create an array and submit
     */
    
        //User generated board
        public function submitBoard($boardArray = null){
            
            if(!is_null($boardArray)):
                $this->board = $boardArray;

                $this->board_valid      = true; //Assume valid but check before generating cells
                $this->board_y_height   = count($boardArray);
                $this->board_x_width    = 0;

                //Check top row array to find width
                foreach($boardArray as $row):
                    if($this->board_x_width == 0):
                        $this->board_x_width = count($row);
                    endif;
                    
                    //Check all rows are the same length
                    if(count($row) != $this->board_x_width):
                        $this->board_valid = false;
                    endif;
                    
                    //Check input in each cell is valid
                    foreach($row as $cell):
                        if(is_null($cell) || !is_int($cell) || ($cell != 0 && $cell != 1)):
                            $this->board_valid = false;
                        endif;
                    endforeach;
                endforeach;

                //Finally check array size is valid
                if(!is_null($this->board_y_height) && !is_null($this->board_x_width) && ($this->board_y_height <= 7 || $this->board_x_width <= 7)):
                    $this->board_valid = false;
                endif;
                
                //Populate with cells
                //Cells are dead on creation
                if($this->board_valid):
                    for($i=0; $i<$this->board_y_height; $i++){
                        for($j=0; $j<$this->board_x_width; $j++){
                            if($this->board[$i][$j] == 0):
                                $this->board[$i][$j] = new cell();
                            else:
                                $this->board[$i][$j] = new cell();
                                $this->board[$i][$j]->setLive(true);
                            endif;
                        }
                    }
                endif;
            endif;
            
            if(!$this->board_valid):
                echo "Array submit error <br />";
                echo "Board size must be at least 8 x 8 <br />";
                echo "All cells in board array must be set as 1 or 0 <br />";
                echo "All rows must have the same number of elements.";
            endif;
        }

        //Create a random board
        public function generateRandomBoard($height = null, $width = null){
            
            if(!is_null($height) && !is_null($width) && is_int($height) & is_int($width) && $height >= 8 && $width >= 8):
                $this->board_y_height   = $height;
                $this->board_x_width    = $width;
                $this->board_valid      = true;
                
                //Populate board with cells and randomly live cell
                for($i=0; $i<$this->board_y_height; $i++){
                    for($j=0; $j<$this->board_x_width; $j++){
                        $this->board[$i][$j] = new cell();
                        $this->board[$i][$j]->setLive(rand(0,1));
                    }
                }
            else:
                echo "Random board size must be at least 8 x 8.";
            endif;
        }
    
        
    /* Board Creation End * * * * * * * * * * * * * * * * * * * * * *  */
        
        
    /**
     * Evolve board
     * Evolve up to a set number of steps
     */
    public function startEvolving($numberOfSteps = null){
        if($this->board_valid):
            if(!is_null($numberOfSteps) && is_int($numberOfSteps) && $numberOfSteps > 0):
                $this->printBoardInfo();

                //Initial state
                $this->printBoardState(0);
                $this->saveBoard(0);

                //Start looping through the steps
                for($i=0;$i<$numberOfSteps; $i++){
                    $this->evolve($i+1);
                    $this->printBoardState($i+1);
                }
                else:
                    echo "Invalid number of steps to start evolving with.";
                endif;
        endif;
    }
 
    private function saveBoard($step){
        for($i=0; $i<$this->board_y_height; $i++){
            for($j=0; $j<$this->board_x_width; $j++){
                $this->boardHistory[$step][$i][$j] = clone $this->board[$i][$j];
            }
        }
    }
    
    /**
     * Evolve the board each step
     * Will set cell states in a temporary board copy
     */
    private function evolve($step){
        
        //Temp board to change cells before copying board over as whole
        $temp_board = array();
        
        for($i=0; $i<$this->board_y_height; $i++){
            for($j=0; $j<$this->board_x_width; $j++){
                $temp_board[$i][$j] = clone $this->board[$i][$j];
            }
        }
        
        //Change all cell states in $temp_board while check against $this->board
        for($i=0; $i<$this->board_y_height; $i++){
            for($j=0; $j<$this->board_x_width; $j++){
                
                //Number of neighbours around a cell
                $numberOfNeighbours = $this->getNumberOfNeighbours($i, $j);
                //echo "y: ".$i." x: ".$j." - ".$numberOfNeighbours."<br />";
                
                switch($numberOfNeighbours):
                    case 0:
                    case 1;
                        $temp_board[$i][$j]->setLive(false);
                        break;
                    
                    //Cell has to be alive first
                    case 2:
                        if($this->board[$i][$j]->getLive()):
                            $temp_board[$i][$j]->setLive(true);
                        endif;
                        break;
                    
                    case 3:
                        $temp_board[$i][$j]->setLive(true);
                        break;
                    
                    default:
                        $temp_board[$i][$j]->setLive(false);
                        break;
                endswitch;
                
            }
        }
        
        //Copy the new board state over
        for($i=0; $i<$this->board_y_height; $i++){
            for($j=0; $j<$this->board_x_width; $j++){
                $this->board[$i][$j] = clone $temp_board[$i][$j];
            }
        }
        
        //Copy the current state of the board
        $this->saveBoard($step);
    }
    
    
    /**
     * Set the points to check for neighbours
     * 
     * [-1,-1][-1, 0][-1,+1]
     * [ 0,-1][     ][ 0,+1]
     * [+1,-1][+1, 0][+1,+1]
     * 
     * The board array wraps around so if x or y is at an edge
     * it will check the other side of the board array
     * 
     */
    private function getNumberOfNeighbours($y_pos, $x_pos){
        $numberOfNeighbours = 0;
        
        
        //Check for wrap around
        //See if x/y point is at edge of the board array
        $x_at_left      = false;
        $x_at_right     = false;
        $y_at_top       = false;
        $y_at_bottom    = false;


            if($y_pos == 0):
                $y_at_top = true;
            elseif($y_pos == $this->board_y_height-1):
                $y_at_bottom = true;
            endif;
            
            if($x_pos == 0):
                $x_at_left = true;
            elseif($x_pos == $this->board_x_width-1):
                $x_at_right = true;
            endif;
        
            
            //y neighbour points
            //- - - - - - - - - - - - - - - - - - - - - - - - - 
            $y_mid_point = $y_pos;
            
            if($y_at_top):
                $y_top_point = $this->board_y_height-1;
            else:
                $y_top_point = $y_pos - 1;
            endif;
            
            if($y_at_bottom):
                $y_bottom_point = 0;
            else:
                $y_bottom_point = $y_pos + 1;
            endif;
        
        
            //x neighbour points
            //- - - - - - - - - - - - - - - - - - - - - - - - - 
            $x_mid_point = $x_pos;
            
            if($x_at_left):
                $x_left_point = $this->board_x_width-1;
            else:
                $x_left_point = $x_pos - 1;
            endif;

            if($x_at_right):
                $x_right_point = 0;
            else:
                $x_right_point = $x_pos + 1;
            endif;
                
                
        /**
         * Check all neighbouring sides of a cell
         */
        
        //Top row
        $numberOfNeighbours +=  $this->board[$y_top_point][$x_left_point]->getLive();      //Top left
        $numberOfNeighbours +=  $this->board[$y_top_point][$x_mid_point]->getLive();       //Top mid
        $numberOfNeighbours +=  $this->board[$y_top_point][$x_right_point]->getLive();     //Top right
        
        //Mid Row
        $numberOfNeighbours +=  $this->board[$y_mid_point][$x_left_point]->getLive();      //Mid left    
        //$numberOfNeighbours +=  $this->board[$y_mid_point][$x_mid_point]->getLive();       //Mid mid is not done because you can't be a neighbour to yourself
        $numberOfNeighbours +=  $this->board[$y_mid_point][$x_right_point]->getLive();     //Mid right
        
        //Bottom Row
        $numberOfNeighbours +=  $this->board[$y_bottom_point][$x_left_point]->getLive();   //Bottom left
        $numberOfNeighbours +=  $this->board[$y_bottom_point][$x_mid_point]->getLive();    //Bottom mid
        $numberOfNeighbours +=  $this->board[$y_bottom_point][$x_right_point]->getLive();  //Bottom right
        
        return $numberOfNeighbours;
    }
    
    
    /**
     * Check for dead board
     */
    public function checkBoardAlive(){
        $one_alive = false;
        
        for($i=0;$i<$this->board_y_height;$i++){
            for($j=0;$j<$this->board_x_width;$j++){
                if($this->board[$i][$j]->getLive())
                    $one_alive = true;
            }
        }
        
        return $one_alive;
    }
    
    /**
     * Check board history to expected results
     */
    public function checkBoardHistory($expectedResults){
        
        $step=0;
        foreach($expectedResults as $board_state_check){
            //var_dump($this->boardHistory[$step]);
            
            $complete_match = true;
            //Loop through the history of each board and compare to user submitted expected results
            for($i=0;$i<$this->board_y_height;$i++){
                for($j=0;$j<$this->board_x_width;$j++){
                   if($board_state_check[$i][$j] != $this->boardHistory[$step][$i][$j]->getLive()):
                       $complete_match = false;
                        break;
                    endif;
                }
            }
            
            
            if($complete_match):
                echo "Board State: ".$step." Matched <br />";
            else:
                echo "Board State: ".$step." Error <br />";
            endif;
            
            
            //var_dump ($board_state_check);
            //var_dump($this->boardHistory[$step]);
            //echo " ######################################################################### ";
        
            $step++;
        }
    }
    
    
    /**
     * Print board information
     */
    private function printBoardInfo(){
        echo "Board Size: ".$this->board_x_width." x ".$this->board_y_height."<br />";
        echo "Width: ".$this->board_x_width."<br />";
        echo "Height: ".$this->board_y_height."<br /><br />";
    }
    
    /**
     * Print current board state
     */
    private function printBoardState($step){
        echo "<br />";
        echo "Board State: ".$step."<br />";
        
        if(!$this->checkBoardAlive()):
            echo "Dead Board <br />";
        endif;
        
        echo "- - - - - - - - - - - - - ";
        echo "<br />";
        
        
        for($i=0; $i<$this->board_y_height; $i++){
            for($j=0; $j<$this->board_x_width; $j++){
                if($this->board[$i][$j]->getLive())
                    echo "O";
                else 
                    echo "X";
            }
            echo "<br />";
        }
    }
    
}


$a_life = new life();
//$a_life->generateRandomBoard(8,8);

$example_board = [
    [0,0,0,0,0,0,0,0],
    [0,0,1,0,0,0,0,0],
    [0,0,1,0,0,0,0,0],
    [0,0,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0]
];

$a_life->submitBoard($example_board);
$a_life->startEvolving(3); //Number of steps



//Compare to expected results
$check_board_steps = [
    [
        [0,0,0,0,0,0,0,0],
        [0,0,1,0,0,0,0,0],
        [0,0,1,0,0,0,0,0],
        [0,0,1,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0]
    ],
    [
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,1,1,1,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0]
    ],
    [
        [0,0,0,0,0,0,0,0],
        [0,0,1,0,0,0,0,0],
        [0,0,1,0,0,0,0,0],
        [0,0,1,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0]
    ],
    [
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,1,1,1,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0]
    ]
];

$a_life->checkBoardHistory($check_board_steps);

?>