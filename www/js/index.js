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
document.addEventListener('deviceready', onDeviceReady , false);
function onDeviceReady (){
    // totalite  du code de l application
    var options      = new ContactFindOptions();
    options.filter   = "";
    options.multiple = true;
    options.hasPhoneNumber = true;
    var fields = [navigator.contacts.phoneNumbers];
    navigator.contacts.find(fields, onSuccess, onError, options);
    alert("HELLO");

    $("#contact").click(function() {
        alert("CLICKED");
        $.ajax({
            method : "GET",
            url : "http://130.190.110.30:8080/api/users", 
            dataType : "json",
            success : function(data, statut) {
                alert("getAppContacts");
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
            url : "http://130.190.110.30:8080/api/user/"+phone, 
            dataType : "json",
            success : function(data, statut) {
                alert("getAppContacts");
            },
            error : function(xhr, statut, erreur) {
                alert(xhr.responseText);
            }
        });
        var first = $('#first').val();
        var last = $('#last').val();
        var phone = $('#phone').val();
        console.log(first);
        console.log(last);
        console.log(phone);
        
    });
    
    $("#member").click(function() {
        alert("OpeningSocket");
        console.log("OpeningSocket");
        socket = io.connect('http://130.190.110.30:8080/');
        alert("Socket Connected");
        console.log("Socket Connected");
        socket.emit('join',{phone:0630637680});
        socket.on('receive_msg',function(data){
           alert("msg : " + data.msg);
           console.log("msg : " + data.msg);
        });
    });

    $("#message").click(function() {
        var myArray = ['0988776655', '0123456789'];
        var myJson = JSON.stringify(myArray); // "[1,2,3]"  
        socket.emit('message',{content:"My message for you", phones:myJson})
        console.log("Message sent");
    });

    function onSuccess(contacts) {
        alert('Found ' + contacts.length + ' contacts.');  
    };

    function onError(contactError) {
        alert('onError!');
    };
}