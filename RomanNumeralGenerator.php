<?php

/** 
 * @author Paul Bennett
 */

/**
 * Roman Numeral Generator Object
 * Returns a String of Roman Numerals up to 3999
 */

interface RomanNumeralGenerator{
    public function generateTest();
    
    public function generate($inputNumber = null);
}

final class RomanNumeralGeneratorImplementation implements RomanNumeralGenerator{
    
    //Symbol breakdown for each digit section
    //Each section array contains the first, fifth and tenth
    //See Basic Decimal Pattern: http://en.wikipedia.org/wiki/Roman_numerals
    protected $unitsArray       = ["I","V","X"];
    protected $tensArray        = ["X","L","C"];
    protected $hundredsArray    = ["C","D","M"];
    protected $thousandsArray   = ["M","?","?"];
    
    
    //Generates a string for each digit
    private function generateDigitString($digit, $digitArray){
        $returnString = "";
        switch($digit){
            case 0:
                break;
            
            //i.e: III
            case 1:
            case 2:
            case 3:
                for($i=0;$i<$digit;$i++){
                    $returnString .= $digitArray[0];
                }
                break;
            
            //i.e IV    
            case 4:
                $returnString .= $digitArray[0].$digitArray[1];
                break;
            
            //i.e V
            case 5:
                $returnString .= $digitArray[1];
                break;
            
            //i.e VIII
            case 6:
            case 7:
            case 8:
                $returnString .= $digitArray[1];
                for($i=5;$i<$digit;$i++){
                    $returnString .= $digitArray[0];
                }
                break;
            
            //i.e IX
            case 9:
                $returnString .= $digitArray[0].$digitArray[2];
                break;
        }
        return $returnString;
    }
    
    private function generateString($inputNumber, $debug){
        //Split $inputString to thosands, hundreds, tens, units digits
        $u  = (int) ($inputNumber%10);
        $t  = (int) (($inputNumber/10)%10);
        $h  = (int) (($inputNumber/100)%10);
        $th = (int) ($inputNumber/1000);
        
        //Create the Roman Numerals for each digit
        $unitString     = $this->generateDigitString($u, $this->unitsArray);
        $tenString      = $this->generateDigitString($t, $this->tensArray);
        $hundredString  = $this->generateDigitString($h, $this->hundredsArray);
        $thousandString = $this->generateDigitString($th, $this->thousandsArray);
        
        
        if($debug){
            echo "<br />"."* * * * * * * * * * * * * * * * * * * *"."<br />";
            echo "Original Number: ".$inputNumber."<br />";
            echo "- - - - - - - - - - - - - - - - - - - -"."<br />";
            echo "thousands: ".$th." = ".$thousandString."<br />";
            echo "hundreds: ".$h." = ".$hundredString."<br />";
            echo "tens: ".$t." =".$tenString."<br />";
            echo "units: ".$u." = ".$unitString."<br />";
            echo "- - - - - - - - - - - - - - - - - - - -"."<br />";
            echo "Spaced: ".$thousandString." ".$hundredString." ".$tenString." ".$unitString."<br />";
            echo "Final: ".$thousandString."".$hundredString."".$tenString."".$unitString."<br />";
            echo "* * * * * * * * * * * * * * * * * * * *"."<br />";
        }
        
        return $thousandString.$hundredString.$tenString.$unitString;
    }
    
    private function compareResult($inputNumber, $expectedResult){
        $romanNumerals = $this->generateString($inputNumber, false);
        
        $match = false;
        $matchString = "FALSE";
        if($romanNumerals == $expectedResult){
            $match = true;      
            $matchString = "TRUE";  
        }

        return "Number: ".(string) $inputNumber." Expected Result: ".$expectedResult." Actual Result: ".$romanNumerals." Matching: ".$matchString." <br />";
    }
    
    public function generateTest(){
        echo "Test Numbers From Wikipedia:"."<br />";
        echo $this->compareResult(39, "XXXIX");
        echo $this->compareResult(246, "CCXLVI");
        echo $this->compareResult(421, "CDXXI");
        echo $this->compareResult(160, "CLX");
        
        echo $this->compareResult(207, "CCVII");
        echo $this->compareResult(1066, "MLXVI");
        
        echo $this->compareResult(1776, "MDCCLXXVI");
        echo $this->compareResult(1954, "MCMLIV");
        echo $this->compareResult(1990, "MCMXC");
        echo $this->compareResult(2014, "MMXIV");
        echo $this->compareResult(2019, "MMXIX");
        echo $this->compareResult(3999, "MMMCMXCIX");
        
        /**
            echo "39: ".$this->generateString(39, false)."<br />";      //XXXIX
            echo "246: ".$this->generateString(246, false)."<br />";    //CCXLVI
            echo "421: ".$this->generateString(421, false)."<br />";    //CDXXI
            echo "160: ".$this->generateString(160, false)."<br />";    //CLX
            echo "207: ".$this->generateString(207, false)."<br />";    //CCVII
            echo "1066: ".$this->generateString(1066, false)."<br />";  //MLXVI
            echo "1776: ".$this->generateString(1776, false)."<br />";  //MDCCLXXVI
            echo "1954: ".$this->generateString(1954, false)."<br />";  //MCMLIV
            echo "1990: ".$this->generateString(1990, false)."<br />";  //MCMXC
            echo "2014: ".$this->generateString(2014, false)."<br />";  //MMXIV
            echo "2019: ".$this->generateString(2019, false)."<br />";  //MMXIX
            echo "3999: ".$this->generateString(3999, false)."<br />";  //MMMCMXCIX
         */
    }
    
    //Check number is valid
    //Due to requirements number is between 1 and 3999
    public function generate($inputNumber = null){
        if(!is_null($inputNumber) && is_int($inputNumber) && $inputNumber >= 1 && $inputNumber <= 3999){
            return $this->generateString($inputNumber, false);
        }
        else{
            echo "INVALID INPUT";
            return null;
        }
    }
}


$romanNumberGenerator = new RomanNumeralGeneratorImplementation();
echo $romanNumberGenerator->generateTest();

echo "<br />"."* * * * * * * * * * * * * * * * * * * *"."<br />";
echo "Your Number: "."<br />";
echo $romanNumberGenerator->generate(62);