/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var socket;
var lat;
var long;
//à changer 
var ip = "129.88.57.27";
document.addEventListener('deviceready', onDeviceReady , false);
function onDeviceReady (){
    // totalite  du code de l application
    var options      = new ContactFindOptions();
    options.filter   = "";
    options.multiple = true;
    options.hasPhoneNumber = true;
    var fields = [navigator.contacts.phoneNumbers];
    alert("HELLO");
    

    $("#contact").click(function() {
        alert("CLICKED");
        $.ajax({
            method : "GET",
            url : "http://"+ip+":8080/api/users", 
            dataType : "json",
            success : function(data, statut) {
                navigator.contacts.find(fields, onSuccessC, onErrorC, options);
                navigator.geolocation.getCurrentPosition(onSuccessG, onErrorG, {enableHighAccuracy: true});
            },
            error : function(xhr, statut, erreur) {
                alert(xhr.responseText);
            }
        });   
    });
    
    $("#submit").click(function() {
        console.log("SUBMIT");
        var phone = $('#phone').val()
        $.ajax({
            method : "GET",
            url : "http://"+ip+":8080/api/user/"+phone, 
            dataType : "json",
            success : function(data, statut) {
                console.log(data.isHere[0].count);
                if(data.isHere[0].count==0){
                    updateForm(phone);
                }
                else {
                    //messagefunction
                }
            },
            error : function(xhr, statut, erreur) {
                alert(xhr.responseText);
            }
        });     
    });
    
    $(document).on("click","#signup", function() {
        console.log("SIGNUP");
        var phone = $('#phone').val();
        var first = $('#first').val();
        var last = $('#last').val();
        navigator.geolocation.getCurrentPosition(onSuccessG, onErrorG, {enableHighAccuracy: true});
        console.log(first);
        console.log(last);
        console.log(phone);
        console.log("POINT("+long+" "+lat+")");
        $.ajax({
            method : "POST",
            url : "http://"+ip+":8080/api/user/",
            data : {prenom:first, nom:last, phone:phone
                , localisation:"POINT("+long+" "+lat+")"}, 
            dataType : "json",
            success : function(data, statut) {
                console.log("Added User "+first+ " "+last);
                //messagefunction
            },
            error : function(xhr, statut, erreur) {
                alert(xhr.responseText);
            }
        });
    });
    
    $("#member").click(function() {
        alert("OpeningSocket");
        console.log("OpeningSocket");
        socket = io.connect('http://'+ip+':8080/');
        alert("Socket Connected");
        console.log("Socket Connected");
        socket.emit('join',{phone:"0630637680"});
        socket.on('receive_msg',function(data){
           alert("msg : " + data.msg);
           console.log("msg : " + data.msg);
        });
    });

    $("#message").click(function() {
        var myArray = ['0988776655', '0123456789'];
        var myJson = JSON.stringify(myArray); // "[1,2,3]"  
        socket.emit('message',{content:"My message for you", phones:myJson});
        console.log("Message sent");
        socket.on('send_me_a_check', function(){
            socket.emit('check');
        });
    });

    function onSuccessC(contacts) {
        alert('Found ' + contacts.length + ' contacts.');  
    };

    function onErrorC(contactError) {
        alert('onError!');
    };

    function updateForm(phone){
        console.log("updateForm");
        $('#ulform ul').prepend('<li class="table-view-cell">\n\
                    <input id="last" type="text" placeholder="Nom"></li>');
        $('#ulform ul').prepend('<li class="table-view-cell">\n\
                    <input id="first" type="text" placeholder="Prénom"></li>');
        $('#ulform ul').append('<li><button id="signup" \n\
                    class="btn btn-positive btn-block">Inscription</button></li>');
        $('#phone').attr("placeholder",phone);
        $('#submit').remove();
    };
    
    function onSuccessG(position) {
        alert('Latitude: '          + position.coords.latitude          + '\n' +
              'Longitude: '         + position.coords.longitude         + '\n' +
              'Altitude: '          + position.coords.altitude          + '\n' +
              'Accuracy: '          + position.coords.accuracy          + '\n' +
              'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
              'Heading: '           + position.coords.heading           + '\n' +
              'Speed: '             + position.coords.speed             + '\n' +
              'Timestamp: '         + position.timestamp                + '\n');
      lat = position.coords.latitude;
      long = position.coords.longitude;
    };

    // onError Callback receives a PositionError object
    //
    function onErrorG(error) {
        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    };
}