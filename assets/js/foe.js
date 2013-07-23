//use strict;


var FOE = function()
{
  var access_token,
      object_id,
      object,
      related_objects,
      objects;
  
  this.getFacebookObject = function(){
    var self = this;
    self.access_token = $('#iAccessToken').val();
    self.object_id = $('#iObjectId').val();
    //var url = "https://graph.facebook.com/"+self.object_id+"?access_token="+self.access_token;
    var url = self.getFacebookUrl(self.object_id);

    if( "" !== self.access_token && "" !== self.object_id){
      $.get(url, function(data){
        var output = JSON.stringify(data, undefined, 2);
        self.object = {objects: { object_json: output }};
        self.related_objects = self.getRelevantIds(data);
        self.fetchRelatedObjects();
      });
    } else {
    }
  }

  this.getFacebookUrl = function(object_id){
    var self = this;
    return "https://graph.facebook.com/"+object_id+"?access_token="+self.access_token;
  }


  this.fetchRelatedObjects = function(){
    var self = this;
    for(var i = 0; i < self.related_objects.length; i++){
      var curObj = self.related_objects[i];
      var url = self.getFacebookUrl(curObj.id);
      $.get(url, function(data){ self.appendRelatedObject(data); }).error(function(){console.log('problem')});
    }
  }

  this.appendRelatedObject = function(json){
    var self = this;
    // find the approprirat eparent_key by looking at data.id
    for(j = 0; j < self.related_objects.length; j++){
      if(self.related_objects[j].id == json.id){
        var parent_key = self.related_objects[j].parent_key;
        break;
      }
    }
    self.objects.push({parent_key: parent_key, object_json: JSON.stringify(json, undefined, 2)});
  }

  this.getRelevantIds = function(data){

    var objects = [],
        self = this;

    function getObjects(obj, key, parent_key) {
      var objects = [];
      for (var i in obj) {
          if (!obj.hasOwnProperty(i)) continue;
          if (typeof obj[i] == 'object') {
              objects = objects.concat(getObjects(obj[i], key, i));
          //} else if (i == key && obj[i] != self.object_id) {
          } else if (i == key) {
              objects.push({parent_key : parent_key, id: obj[i]});
          }
      }
      return objects;
    }
    objects = getObjects(data, 'id', 'root');
    return objects;
  }

  this.renderObjects = function(){
    console.log('renderObjects');
    var self = this;
    var source   = $("#objects-template").html(),
        template = Handlebars.compile(source),
        //data =  self.related_objects;
        data =  self.object;
    $("#content-objects").html(template(data));
  }

  this.addAlert = function(message, priority){
    priority = priority || "";
    $('#alertbar').append(
        '<div class="alert '+priority+'">' +
            '<button type="button" class="close" data-dismiss="alert">&times;</button>' + 
            message + 
        '</div>');
  }

  var init = function(self){

    // FOE instance field vars 
    self.object = undefined;
    self.object_id = undefined;
    self.access_token = undefined;
    self.related_objects = Array();
    self.objects = ko.observableArray();

    // Event Handling
    $('#btnSendRequest').click(function(){
      self.getFacebookObject();
    });
    
    // Knockout bindings  
    ko.applyBindings({loadedObjects : self.objects});  

    // jQuery setup
    $.ajaxSetup({
      error: function(xhr){
        var message = "There was a problem : ("+xhr.status+") " +xhr.responseText;
        self.addAlert(message, "alert-error");
        console.log(xhr);
      }
    });

    // Bootstrap setup
    //$(".alert").alert();
  }

  // Engage, #1.
  init(this);
};

window.onload = onLoad();

function onLoad(){
  window.foe = new FOE();
  //console.log('load');
  //console.log(foe);
}
