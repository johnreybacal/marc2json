var obj;
var marc = {

	init: function(){
		$('#marc-input').change(function(){
			var fileToLoad = document.getElementById("marc-input").files[0];

			var fileReader = new FileReader();
			fileReader.onload = function(fileLoadedEvent){
			    var text = fileLoadedEvent.target.result;			    
			    marc.read(text);
			};
			fileReader.readAsText(fileToLoad, "UTF-8");			
		});
	},

	read: function(marcText){
		var hex = String.fromCharCode;
		var record = marcText.split(hex(0x1d));				
		var json = '{';		        
		for (var i = 0; i < record.length - 1; i++)
        {                      	
        	json += '"record' + i + '": {';
            var x = record[i].split(hex(0x1e));
         	var tags = marc.getTags(x[0]);
            var first = true;
            var tCounter = 0;
            var isTagDuplicate = false;
            for(var j = 1; j < x.length - 1; j++){
                var y = x[j].split(hex(0x1f));

         		if(first)
                    first = false;
                else
         			json += ',';

                isTagDuplicate = marc.checkDuplicateTags(tags, j - 1);                                    

                if(!isTagDuplicate){                        
                    if(tCounter != 0){
                        json = json.substr(0, json.length - 1);
                        json += '}';
                    }
                    if(json.charAt(json.length - 1) != ',' && json.charAt(json.length - 1) != '{')
                        json += ',';
                    tCounter = 0;
                    try{
                        json += '"' + tags[j - 1] + '":';
    	         	}catch(e){	         		
    	         	}
                }else{//is duplicate
                    if(tCounter == 0){
                        json += '"' + tags[j - 1] + '":{';
                    }
                    json += '"' + tCounter + '":';                        
                    tCounter++;
                }

                //values
                //if value contains indicators and subfields
         		if(y.length > 2){                        
     			    json += '{';         			
                    //if value has indicator
         			if(y[0] != '  ')
         				json += '"' + y[0] + '": {';     				     		
         			
                    //value have subfields
     				for(k = 1; k < y.length; k++){     					
     					if(y[k].length > 1)
    						json += '"' + y[k].substr(0, 1) + '": "' + y[k].substr(1).replace(/"/g, "'") + '"';
     					
    					if(k != y.length - 1)
    						json += ',';
    					
     				}   

     				if(y[0] != '  ')
     					json += '}';
     				

     				json += '}';
         		}
                //if value does not contain indicators and subfields
         		else if(y.length == 1)
         			json += '"' + y[0].replace(/"/g, "'") + '"';
         		
                //if value contains indicators and subfields, but with single data this time
         		else{             		
                    json += '{';     
                    //if value has indicator
         			if(y[0] != '  ')
         				json += '"' + y[0] + '": {';
         			
                    //value have subfields
         			if(y[1].length > 0)
         				json += '"' + y[1].substr(0, 1) + '": "' + y[1].substr(1).replace(/"/g, "'") + '"';
         			
         			if(y[0] != '  ')
     					json += '}';
         			

     				json += '}';
         		}                
            
         	}

         	json += '}';

            try{
                JSON.parse(json + '}');
            }catch(e){
                //hindi nagsasara
                JSON.parse(json + '}}');
                json += '}';
            }

            if(i < record.length - 2){
                json += ',';
            }
        }            
        json += '}';

        obj = JSON.parse(json);            

        //console.log(obj);        
	},

    checkDuplicateTags: function(x, index){
        try{
            return (x[index] == x[index + 1] || x[index] == x[index - 1]);
        }catch(e){
            return false;
        }
    },

	getTags: function(x){
		var tag = x.substr(x.indexOf('4500')).substr(4);
		var tags = marc.splitInParts(tag);
		tags = marc.removeEmpty(tags);
		var realTags = [];
		for(var j = 0; j < tags.length; j += 4){
			if(tags[j] || tags[j] == '0')
				realTags.push(tags[j])			
		}		
		return marc.removeEmpty(realTags);
	},

	splitInParts: function(s){
		var partLength = 3;
		var x = [];		
		for(var i = 0; i < s.length; i += partLength){
			x[i] = s.substr(i, Math.min(partLength, s.length - i));
		}
		return x;
	},

	removeEmpty: function(x){
		var temp = [];
		x.forEach(function(s){
			if(s || s == '0')
				temp.push(s);
		});
		return temp;
	}

}
$(document).ready(function(){
	marc.init();
});