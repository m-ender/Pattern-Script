var canSetHTMLColors=false;
var canDump=true;
var canYoutube=false;
var inputHistory=[];
var compiledText;
var IDE=true;
var recordingStartsFromLevel = 0 // for input recorder

function convertLevelToString()
{
	var out = '';
	var seenCells = {};
	var i = 0;
	for (var y = 0; y < level.height; y++)
	{
		for (var x = 0; x < level.width; x++)
		{
			const bitmask = level.getCell(x + y*level.width);
			var objs = [];
			for (var bit = 0; bit < 32 * STRIDE_OBJ; ++bit)
			{
				if (bitmask.get(bit))
				{
					objs.push(state.identifiers.objects[state.idDict[bit]].name)
				}
			}
			objs.sort();
			objs = objs.join(" ");
			/* replace repeated object combinations with numbers */
			if (!seenCells.hasOwnProperty(objs))
			{
				seenCells[objs] = i++;
				out += objs + ":";
			}
			out += seenCells[objs] + ",";
		}
		out += '\n';
	}
	return out;
}

function stripHTMLTags(html_str){
	var div = document.createElement("div");
	div.innerHTML = html_str;
	var text = div.textContent || div.innerText || "";
	return text.trim();
}

function dumpTestCase() {
	//compiler error data
	var levelDat = compiledText;
	var errorStrings_stripped = errorStrings.map(stripHTMLTags);
	var resultarray = [levelDat,errorStrings_stripped,errorCount];
	var resultstring = JSON.stringify(resultarray);
	consolePrint("<br>Compilation error/warning data (for error message tests - errormessage_testdata.js):<br><br><br>"+resultstring+"<br><br><br>",true);

	
	//normal session recording data
	var levelDat = compiledText;
	var input = inputHistory.concat([]);
	var outputDat = convertLevelToString();

	var resultarray = [levelDat,input,outputDat,recordingStartsFromLevel,loadedLevelSeed]
	var resultstring = JSON.stringify(resultarray);
	consolePrint("<br>Recorded play session data (for play session tests - testdata.js):<br><br><br>"+resultstring+"<br><br><br>",true);

}

function clearInputHistory()
{
	if (canDump === true)
	{
		inputHistory=[]
		recordingStartsFromLevel = curlevel
	}
}

function pushInput(inp) {
	if (canDump===true) {
		inputHistory.push(inp);
	}
}