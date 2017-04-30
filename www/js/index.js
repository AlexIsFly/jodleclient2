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
var longi;
var phone;
var allcontacts = [];
var fakephones = ["(123) 456-7890","(987) 654-3211"]
//à changer 
var ip = "192.168.0.37";
document.addEventListener('deviceready', onDeviceReady , false);
function onDeviceReady (){
    // totalite  du code de l application
    alert("Welcome to Jodle");
    
    
    //We check if the phone number entered is already in the db
    $("#submit").click(function() {
        console.log("SUBMIT");
        phone = $('#phone').val()
        console.log(phone);
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
                   loginSuccessful();
                }
            },
            error : function(xhr, statut, erreur) {
                alert(xhr.responseText);
            }
        });     
        console.log("AJAX done");   
    });
    
    $(document).on("click","#signup", function() {
        console.log("SIGNUP");
        phone = $('#phone').val();
        var first = $('#first').val();
        var last = $('#last').val();
        navigator.geolocation.getCurrentPosition(function(position) {
            console.log(first);
            console.log(last);
            console.log(phone);
            alert('Latitude: '          + position.coords.latitude          + '\n' +
              'Longitude: '         + position.coords.longitude         + '\n' +
              'Altitude: '          + position.coords.altitude          + '\n' +
              'Accuracy: '          + position.coords.accuracy          + '\n' +
              'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
              'Heading: '           + position.coords.heading           + '\n' +
              'Speed: '             + position.coords.speed             + '\n' +
              'Timestamp: '         + position.timestamp                + '\n');
            lat = position.coords.latitude;
            longi = position.coords.longitude;
            console.log("POINT("+longi+" "+lat+")");
            $.ajax({
                method : "POST",
                url : "http://"+ip+":8080/api/user/",
                data : $(this).serialize() + '&prenom=' + first + '&nom=' + last + '&phone=' + phone + '&localisation=POINT('+longi+ ' ' + lat+')',
                contentType : 'application/x-www-form-urlencoded', 
                dataType : "json",
                success : function(data, statut) {
                    console.log("Added User "+first+ " "+last);
                    loginSuccessful();
                },
                error : function(xhr, statut, erreur) {
                    alert(xhr.responseText);
                }
            });
        }
        , onErrorG, {enableHighAccuracy: true});
       
    });
    
    function loginSuccessful() {
        alert("Login Successful");
        var options      = new ContactFindOptions();
        var i;
        options.filter   = "";
        options.multiple = true;
        options.hasPhoneNumber = true;
        var fields = [navigator.contacts.phoneNumbers];       
        navigator.contacts.find(fields, function(contacts){
            console.log('Found ' + contacts.length + ' contacts.');
            for(i=0; i<contacts.length; i++) {
                var phonenumber = contacts[i].phoneNumbers[0].value
                console.log("BEFORE : "+phonenumber);
                var stdphonenumber = phonenumber.replace(/[^0-9]/g, '');
                console.log("AFTER : "+stdphonenumber);
                allcontacts.push(stdphonenumber);
            }
        }
        , onErrorC, options);
        alert("OpeningSocket");
        console.log("OpeningSocket");
        socket = io.connect('http://'+ip+':8080/');
        alert("Socket Connected");
        console.log("Socket Connected");
        socket.emit('join',{phone:phone});
        socket.on('receive_msg',function(data){
           alert("msg : " + data);
           console.log("msg : " + data);
        });
        socket.on('messages_bdd',function(data){
           for (var i = 0; i < data.length; i++) {
                 alert("Message " + (i+1) + " " + data[i].messages);
                 console.log("BDD : " + data[i].messages);
            } 
        });
        updateSendMessage();
    }

    $(document).on("click","#send", function() {
        console.log("SENDMESSAGE");
        var myArray = allcontacts;
        var msgcontent = $("#msgcontent");
        var myJson = JSON.stringify(myArray); // "[1,2,3]" 
        alert("Sent to " + myJson);
        socket.emit('message',{content:"My message for you from one", phones:myJson});
        console.log("Message sent");
    });


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
    
    function updateSendMessage(){
        $('#ulform ul').empty();
        $('#ulform ul').append('<li class="table-view-cell">\n\
            <p>VOTRE MESSAGE</p>\n\
            <textarea id="msgcontent" rows="5"></textarea></li>');
        $('#ulform ul').append('<li class="table-view-cell">\n\
                    <button id="send" \n\
                    class="btn btn-positive btn-block">Envoyer</button></li>');
    };
    
    // onError Callback for contact
    function onErrorC(contactError) {
        alert('Contact onError!');
    };

    // onError Callback for geolocalisation
    function onErrorG(error) {
        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    };
    
    
    //All below are for testing purposes ONLY
    
    
    //button clickMe, useless and outdated
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
    
    
    //button Member, useless and outdated
    $("#member").click(function() {
        alert("OpeningSocket");
        console.log("OpeningSocket");
        socket = io.connect('http://'+ip+':8080/');
        alert("Socket Connected");
        console.log("Socket Connected");
        socket.emit('join',{phone:phone});

    });
    
    //button SendMessage, useless and outdated
    $("#message").click(function() {
        var myArray = allcontacts;
        var myJson = JSON.stringify(myArray); // "[1,2,3]"
        socket.emit('message',{content:"My message for you from one", phones:myJson});
        console.log("Message sent");
        socket.on('send_me_a_check', function(){
            socket.emit('check');
        });
    });
    
}