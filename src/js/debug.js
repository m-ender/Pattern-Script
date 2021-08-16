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
			const bitmask = level.getCell(x + y*level.width); // TODO: it should be y + x*level.height
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
				out += objs + ":"; // TODO: can conflict with semicolons in the names of objects with tags
			}
			out += seenCells[objs] + ",";
		}
		out += '\n';
	}
	return out;
}

function levelFromUnitTestString(str)
{
	const lines = str.split('\n')
	const height = lines.length - 1
	const width = lines[0].split(',').length - 1
	var lev = new Level(undefined, width, height, state.collisionLayers.length, new Int32Array(width * height * STRIDE_OBJ))
	var masks = []
	for (const [y, line] of lines.entries())
	{
		for (const [x, cell_content] of line.split(',').entries())
		{
			if (cell_content.length == 0)
				continue
			var cell_parts = cell_content.split(':')
			if (cell_parts.length > 1)
			{
				const object_names = cell_parts[0].split(' ')
				const objects = object_names.map( object_name => state.identifiers.objects.find( o => (object_name === o.name) ) )
				const mask = makeMaskFromGlyph( objects.map( o => o.id ) )
				masks.push(mask)
			}
			const mask_id = parseInt(cell_parts[cell_parts.length - 1])
			const maskint = masks[mask_id]
			lev.setCell(x + y*width, maskint)
		}
	}
	return lev
}

function loadUnitTestStringLevel(str)
{
	loadLevelFromLevelDat(state, levelFromUnitTestString(str), null)
	canvasResize()
}


function stripHTMLTags(html_str)
{
	if (typeof html_str !== 'string')
		return html_str
	var div = document.createElement("div");
	div.innerHTML = html_str;
	var text = div.textContent || div.innerText || "";
	return text.trim();
}

function dumpTestCase()
{
	//compiler error data
	const levelDat = compiledText
	const resultstring = JSON.stringify( [levelDat, errorStrings.map(stripHTMLTags), warningStrings.map(stripHTMLTags)] )
	consolePrint("<br>Compilation error/warning data (for error message tests - errormessage_testdata.js):<br><br><br>"+resultstring+"<br><br><br>", true)
	
	//normal session recording data
	if (level !== undefined)
	{
		const resultstring = JSON.stringify( [levelDat, inputHistory.concat([]), convertLevelToString(), recordingStartsFromLevel, loadedLevelSeed] )
		consolePrint("<br>Recorded play session data (for play session tests - testdata.js):<br><br><br>"+resultstring+"<br><br><br>",true);
	}
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