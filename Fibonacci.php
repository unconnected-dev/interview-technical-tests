<?php

/**
 * @author Paul Bennett 
 */

/**
 * Fibonacci Solution
 * Find the nth number in the Fibonacci sequence
 */

final class fibonacci{
    
    public function printFibonacciNumber($input_number = null){
        //Check valid number first
        if(!is_null($input_number) && is_int($input_number)):
            //First 2 numbers in sequence
            $f0 = 0;
            $f1 = 1;
            $fTotal = 0;

            //Start loop if trying to find past the first two numbers in sequence
            if($input_number >= 3):
                for($i=2; $i<$input_number; $i++){
                    $fTotal = $f0 + $f1;

                    $f0 = $f1;
                    $f1 = $fTotal;
                }
            //First number is 0 which is the default value    
            elseif($input_number == 2):
                $fTotal = $f1;
            endif;

            echo "The ".$input_number." in the Fibonacci sequence is: ". $fTotal." <br />";
        else:
            echo '$input_number error. check integer is being submitted';
        endif;
        
    }
}

$find = new fibonacci();
$find->printFibonacciNumber(34);