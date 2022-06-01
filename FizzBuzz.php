<?php

/* 
 * @author Paul Bennett
 */

/**
 * FizzBuzz Solution
 * Display Fizz when number multiple of 3
 * Display Buzz when number multiple of 5
 * Display FizzBuzz when number multiple of 3 and 5
 * Display number if not above
 */

interface FizzBuzzGenerator{
    public function generateFizzBuzz($from = null, $to = null);
}

final class FizzBuzzGeneratorImplementation implements FizzBuzzGenerator{
    
    //Check if input is multiple of 3,5 or both
    //Return accordingly
    //I include the $inputNumber across all for ease of reading
    private function findFizzBuzz($inputNumber){
        $multiple_3 = $inputNumber % 3;
        $multiple_5 = $inputNumber % 5;
        
        if($multiple_3 == 0 && $multiple_5 == 0){
            return (string) $inputNumber.": FizzBuzz";
        }        
        else if($multiple_3 == 0){
            return (string) $inputNumber.": Fizz";
        }
        else if($multiple_5 == 0){
            return (string) $inputNumber.": Buzz";
        }
        else{
            return (string) $inputNumber;
        }
    }
    
    //Check number range between $from and $to
    public function generateFizzBuzz($from = null, $to = null){
        //Check valid input
        if(!is_null($from) && !is_null($to) && is_int($from) && is_int($to) && $from < $to){
            
            for($i=$from; $i < $to + 1; $i++){
                echo $this->findFizzBuzz($i)."<br />";
            }
            
        }
        
        //Invalid input errors
        else{
            echo "Invalid Input"."<br />";
            if(is_null($from) || is_null($to)){
                echo "Input Numbers null";
            }
            else if(!is_int($from) || !is_int($to)){
                echo "Input Numbers not integers";
            }
            else if($from >= $to){
                echo '$from >= $to';
            }
        }
    }
}

$fizzBuzz = new FizzBuzzGeneratorImplementation();
echo $fizzBuzz->generateFizzBuzz(0, 100);