<?php
$person = $_GET['naim'];
if(strtolower($person) == 'kleb' or strtolower($person) == 'kaleb') {
    $output = 'ur bad';
} else {
    $output = $person . 'is bad';
}
?>

<p><?php echo $output; ?></p>';