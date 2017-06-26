window.qtip_init = (function() {
  // lodash
  var lodash = (function() {
    require=function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}({lodash:[function(require,module,exports){(function(global){(function(){var undefined;var VERSION="4.17.4";var LARGE_ARRAY_SIZE=200;var CORE_ERROR_TEXT="Unsupported core-js use. Try https://npms.io/search?q=ponyfill.",FUNC_ERROR_TEXT="Expected a function";var HASH_UNDEFINED="__lodash_hash_undefined__";var MAX_MEMOIZE_SIZE=500;var PLACEHOLDER="__lodash_placeholder__";var CLONE_DEEP_FLAG=1,CLONE_FLAT_FLAG=2,CLONE_SYMBOLS_FLAG=4;var COMPARE_PARTIAL_FLAG=1,COMPARE_UNORDERED_FLAG=2;var WRAP_BIND_FLAG=1,WRAP_BIND_KEY_FLAG=2,WRAP_CURRY_BOUND_FLAG=4,WRAP_CURRY_FLAG=8,WRAP_CURRY_RIGHT_FLAG=16,WRAP_PARTIAL_FLAG=32,WRAP_PARTIAL_RIGHT_FLAG=64,WRAP_ARY_FLAG=128,WRAP_REARG_FLAG=256,WRAP_FLIP_FLAG=512;var DEFAULT_TRUNC_LENGTH=30,DEFAULT_TRUNC_OMISSION="...";var HOT_COUNT=800,HOT_SPAN=16;var LAZY_FILTER_FLAG=1,LAZY_MAP_FLAG=2,LAZY_WHILE_FLAG=3;var INFINITY=1/0,MAX_SAFE_INTEGER=9007199254740991,MAX_INTEGER=1.7976931348623157e308,NAN=0/0;var MAX_ARRAY_LENGTH=4294967295,MAX_ARRAY_INDEX=MAX_ARRAY_LENGTH-1,HALF_MAX_ARRAY_LENGTH=MAX_ARRAY_LENGTH>>>1;var wrapFlags=[["ary",WRAP_ARY_FLAG],["bind",WRAP_BIND_FLAG],["bindKey",WRAP_BIND_KEY_FLAG],["curry",WRAP_CURRY_FLAG],["curryRight",WRAP_CURRY_RIGHT_FLAG],["flip",WRAP_FLIP_FLAG],["partial",WRAP_PARTIAL_FLAG],["partialRight",WRAP_PARTIAL_RIGHT_FLAG],["rearg",WRAP_REARG_FLAG]];var argsTag="[object Arguments]",arrayTag="[object Array]",asyncTag="[object AsyncFunction]",boolTag="[object Boolean]",dateTag="[object Date]",domExcTag="[object DOMException]",errorTag="[object Error]",funcTag="[object Function]",genTag="[object GeneratorFunction]",mapTag="[object Map]",numberTag="[object Number]",nullTag="[object Null]",objectTag="[object Object]",promiseTag="[object Promise]",proxyTag="[object Proxy]",regexpTag="[object RegExp]",setTag="[object Set]",stringTag="[object String]",symbolTag="[object Symbol]",undefinedTag="[object Undefined]",weakMapTag="[object WeakMap]",weakSetTag="[object WeakSet]";var arrayBufferTag="[object ArrayBuffer]",dataViewTag="[object DataView]",float32Tag="[object Float32Array]",float64Tag="[object Float64Array]",int8Tag="[object Int8Array]",int16Tag="[object Int16Array]",int32Tag="[object Int32Array]",uint8Tag="[object Uint8Array]",uint8ClampedTag="[object Uint8ClampedArray]",uint16Tag="[object Uint16Array]",uint32Tag="[object Uint32Array]";var reEmptyStringLeading=/\b__p \+= '';/g,reEmptyStringMiddle=/\b(__p \+=) '' \+/g,reEmptyStringTrailing=/(__e\(.*?\)|\b__t\)) \+\n'';/g;var reEscapedHtml=/&(?:amp|lt|gt|quot|#39);/g,reUnescapedHtml=/[&<>"']/g,reHasEscapedHtml=RegExp(reEscapedHtml.source),reHasUnescapedHtml=RegExp(reUnescapedHtml.source);var reEscape=/<%-([\s\S]+?)%>/g,reEvaluate=/<%([\s\S]+?)%>/g,reInterpolate=/<%=([\s\S]+?)%>/g;var reIsDeepProp=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,reIsPlainProp=/^\w*$/,reLeadingDot=/^\./,rePropName=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;var reRegExpChar=/[\\^$.*+?()[\]{}|]/g,reHasRegExpChar=RegExp(reRegExpChar.source);var reTrim=/^\s+|\s+$/g,reTrimStart=/^\s+/,reTrimEnd=/\s+$/;var reWrapComment=/\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/,reWrapDetails=/\{\n\/\* \[wrapped with (.+)\] \*/,reSplitDetails=/,? & /;var reAsciiWord=/[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;var reEscapeChar=/\\(\\)?/g;var reEsTemplate=/\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;var reFlags=/\w*$/;var reIsBadHex=/^[-+]0x[0-9a-f]+$/i;var reIsBinary=/^0b[01]+$/i;var reIsHostCtor=/^\[object .+?Constructor\]$/;var reIsOctal=/^0o[0-7]+$/i;var reIsUint=/^(?:0|[1-9]\d*)$/;var reLatin=/[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;var reNoMatch=/($^)/;var reUnescapedString=/['\n\r\u2028\u2029\\]/g;var rsAstralRange="\\ud800-\\udfff",rsComboMarksRange="\\u0300-\\u036f",reComboHalfMarksRange="\\ufe20-\\ufe2f",rsComboSymbolsRange="\\u20d0-\\u20ff",rsComboRange=rsComboMarksRange+reComboHalfMarksRange+rsComboSymbolsRange,rsDingbatRange="\\u2700-\\u27bf",rsLowerRange="a-z\\xdf-\\xf6\\xf8-\\xff",rsMathOpRange="\\xac\\xb1\\xd7\\xf7",rsNonCharRange="\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf",rsPunctuationRange="\\u2000-\\u206f",rsSpaceRange=" \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000",rsUpperRange="A-Z\\xc0-\\xd6\\xd8-\\xde",rsVarRange="\\ufe0e\\ufe0f",rsBreakRange=rsMathOpRange+rsNonCharRange+rsPunctuationRange+rsSpaceRange;var rsApos="['’]",rsAstral="["+rsAstralRange+"]",rsBreak="["+rsBreakRange+"]",rsCombo="["+rsComboRange+"]",rsDigits="\\d+",rsDingbat="["+rsDingbatRange+"]",rsLower="["+rsLowerRange+"]",rsMisc="[^"+rsAstralRange+rsBreakRange+rsDigits+rsDingbatRange+rsLowerRange+rsUpperRange+"]",rsFitz="\\ud83c[\\udffb-\\udfff]",rsModifier="(?:"+rsCombo+"|"+rsFitz+")",rsNonAstral="[^"+rsAstralRange+"]",rsRegional="(?:\\ud83c[\\udde6-\\uddff]){2}",rsSurrPair="[\\ud800-\\udbff][\\udc00-\\udfff]",rsUpper="["+rsUpperRange+"]",rsZWJ="\\u200d";var rsMiscLower="(?:"+rsLower+"|"+rsMisc+")",rsMiscUpper="(?:"+rsUpper+"|"+rsMisc+")",rsOptContrLower="(?:"+rsApos+"(?:d|ll|m|re|s|t|ve))?",rsOptContrUpper="(?:"+rsApos+"(?:D|LL|M|RE|S|T|VE))?",reOptMod=rsModifier+"?",rsOptVar="["+rsVarRange+"]?",rsOptJoin="(?:"+rsZWJ+"(?:"+[rsNonAstral,rsRegional,rsSurrPair].join("|")+")"+rsOptVar+reOptMod+")*",rsOrdLower="\\d*(?:(?:1st|2nd|3rd|(?![123])\\dth)\\b)",rsOrdUpper="\\d*(?:(?:1ST|2ND|3RD|(?![123])\\dTH)\\b)",rsSeq=rsOptVar+reOptMod+rsOptJoin,rsEmoji="(?:"+[rsDingbat,rsRegional,rsSurrPair].join("|")+")"+rsSeq,rsSymbol="(?:"+[rsNonAstral+rsCombo+"?",rsCombo,rsRegional,rsSurrPair,rsAstral].join("|")+")";var reApos=RegExp(rsApos,"g");var reComboMark=RegExp(rsCombo,"g");var reUnicode=RegExp(rsFitz+"(?="+rsFitz+")|"+rsSymbol+rsSeq,"g");var reUnicodeWord=RegExp([rsUpper+"?"+rsLower+"+"+rsOptContrLower+"(?="+[rsBreak,rsUpper,"$"].join("|")+")",rsMiscUpper+"+"+rsOptContrUpper+"(?="+[rsBreak,rsUpper+rsMiscLower,"$"].join("|")+")",rsUpper+"?"+rsMiscLower+"+"+rsOptContrLower,rsUpper+"+"+rsOptContrUpper,rsOrdUpper,rsOrdLower,rsDigits,rsEmoji].join("|"),"g");var reHasUnicode=RegExp("["+rsZWJ+rsAstralRange+rsComboRange+rsVarRange+"]");var reHasUnicodeWord=/[a-z][A-Z]|[A-Z]{2,}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;var contextProps=["Array","Buffer","DataView","Date","Error","Float32Array","Float64Array","Function","Int8Array","Int16Array","Int32Array","Map","Math","Object","Promise","RegExp","Set","String","Symbol","TypeError","Uint8Array","Uint8ClampedArray","Uint16Array","Uint32Array","WeakMap","_","clearTimeout","isFinite","parseInt","setTimeout"];var templateCounter=-1;var typedArrayTags={};typedArrayTags[float32Tag]=typedArrayTags[float64Tag]=typedArrayTags[int8Tag]=typedArrayTags[int16Tag]=typedArrayTags[int32Tag]=typedArrayTags[uint8Tag]=typedArrayTags[uint8ClampedTag]=typedArrayTags[uint16Tag]=typedArrayTags[uint32Tag]=true;typedArrayTags[argsTag]=typedArrayTags[arrayTag]=typedArrayTags[arrayBufferTag]=typedArrayTags[boolTag]=typedArrayTags[dataViewTag]=typedArrayTags[dateTag]=typedArrayTags[errorTag]=typedArrayTags[funcTag]=typedArrayTags[mapTag]=typedArrayTags[numberTag]=typedArrayTags[objectTag]=typedArrayTags[regexpTag]=typedArrayTags[setTag]=typedArrayTags[stringTag]=typedArrayTags[weakMapTag]=false;var cloneableTags={};cloneableTags[argsTag]=cloneableTags[arrayTag]=cloneableTags[arrayBufferTag]=cloneableTags[dataViewTag]=cloneableTags[boolTag]=cloneableTags[dateTag]=cloneableTags[float32Tag]=cloneableTags[float64Tag]=cloneableTags[int8Tag]=cloneableTags[int16Tag]=cloneableTags[int32Tag]=cloneableTags[mapTag]=cloneableTags[numberTag]=cloneableTags[objectTag]=cloneableTags[regexpTag]=cloneableTags[setTag]=cloneableTags[stringTag]=cloneableTags[symbolTag]=cloneableTags[uint8Tag]=cloneableTags[uint8ClampedTag]=cloneableTags[uint16Tag]=cloneableTags[uint32Tag]=true;cloneableTags[errorTag]=cloneableTags[funcTag]=cloneableTags[weakMapTag]=false;var deburredLetters={"À":"A","Á":"A","Â":"A","Ã":"A","Ä":"A","Å":"A","à":"a","á":"a","â":"a","ã":"a","ä":"a","å":"a","Ç":"C","ç":"c","Ð":"D","ð":"d","È":"E","É":"E","Ê":"E","Ë":"E","è":"e","é":"e","ê":"e","ë":"e","Ì":"I","Í":"I","Î":"I","Ï":"I","ì":"i","í":"i","î":"i","ï":"i","Ñ":"N","ñ":"n","Ò":"O","Ó":"O","Ô":"O","Õ":"O","Ö":"O","Ø":"O","ò":"o","ó":"o","ô":"o","õ":"o","ö":"o","ø":"o","Ù":"U","Ú":"U","Û":"U","Ü":"U","ù":"u","ú":"u","û":"u","ü":"u","Ý":"Y","ý":"y","ÿ":"y","Æ":"Ae","æ":"ae","Þ":"Th","þ":"th","ß":"ss","Ā":"A","Ă":"A","Ą":"A","ā":"a","ă":"a","ą":"a","Ć":"C","Ĉ":"C","Ċ":"C","Č":"C","ć":"c","ĉ":"c","ċ":"c","č":"c","Ď":"D","Đ":"D","ď":"d","đ":"d","Ē":"E","Ĕ":"E","Ė":"E","Ę":"E","Ě":"E","ē":"e","ĕ":"e","ė":"e","ę":"e","ě":"e","Ĝ":"G","Ğ":"G","Ġ":"G","Ģ":"G","ĝ":"g","ğ":"g","ġ":"g","ģ":"g","Ĥ":"H","Ħ":"H","ĥ":"h","ħ":"h","Ĩ":"I","Ī":"I","Ĭ":"I","Į":"I","İ":"I","ĩ":"i","ī":"i","ĭ":"i","į":"i","ı":"i","Ĵ":"J","ĵ":"j","Ķ":"K","ķ":"k","ĸ":"k","Ĺ":"L","Ļ":"L","Ľ":"L","Ŀ":"L","Ł":"L","ĺ":"l","ļ":"l","ľ":"l","ŀ":"l","ł":"l","Ń":"N","Ņ":"N","Ň":"N","Ŋ":"N","ń":"n","ņ":"n","ň":"n","ŋ":"n","Ō":"O","Ŏ":"O","Ő":"O","ō":"o","ŏ":"o","ő":"o","Ŕ":"R","Ŗ":"R","Ř":"R","ŕ":"r","ŗ":"r","ř":"r","Ś":"S","Ŝ":"S","Ş":"S","Š":"S","ś":"s","ŝ":"s","ş":"s","š":"s","Ţ":"T","Ť":"T","Ŧ":"T","ţ":"t","ť":"t","ŧ":"t","Ũ":"U","Ū":"U","Ŭ":"U","Ů":"U","Ű":"U","Ų":"U","ũ":"u","ū":"u","ŭ":"u","ů":"u","ű":"u","ų":"u","Ŵ":"W","ŵ":"w","Ŷ":"Y","ŷ":"y","Ÿ":"Y","Ź":"Z","Ż":"Z","Ž":"Z","ź":"z","ż":"z","ž":"z","Ĳ":"IJ","ĳ":"ij","Œ":"Oe","œ":"oe","ŉ":"'n","ſ":"s"};var htmlEscapes={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};var htmlUnescapes={"&amp;":"&","&lt;":"<","&gt;":">","&quot;":'"',"&#39;":"'"};var stringEscapes={"\\":"\\","'":"'","\n":"n","\r":"r","\u2028":"u2028","\u2029":"u2029"};var freeParseFloat=parseFloat,freeParseInt=parseInt;var freeGlobal=typeof global=="object"&&global&&global.Object===Object&&global;var freeSelf=typeof self=="object"&&self&&self.Object===Object&&self;var root=freeGlobal||freeSelf||Function("return this")();var freeExports=typeof exports=="object"&&exports&&!exports.nodeType&&exports;var freeModule=freeExports&&typeof module=="object"&&module&&!module.nodeType&&module;var moduleExports=freeModule&&freeModule.exports===freeExports;var freeProcess=moduleExports&&freeGlobal.process;var nodeUtil=function(){try{return freeProcess&&freeProcess.binding&&freeProcess.binding("util")}catch(e){}}();var nodeIsArrayBuffer=nodeUtil&&nodeUtil.isArrayBuffer,nodeIsDate=nodeUtil&&nodeUtil.isDate,nodeIsMap=nodeUtil&&nodeUtil.isMap,nodeIsRegExp=nodeUtil&&nodeUtil.isRegExp,nodeIsSet=nodeUtil&&nodeUtil.isSet,nodeIsTypedArray=nodeUtil&&nodeUtil.isTypedArray;function addMapEntry(map,pair){map.set(pair[0],pair[1]);return map}function addSetEntry(set,value){set.add(value);return set}function apply(func,thisArg,args){switch(args.length){case 0:return func.call(thisArg);case 1:return func.call(thisArg,args[0]);case 2:return func.call(thisArg,args[0],args[1]);case 3:return func.call(thisArg,args[0],args[1],args[2])}return func.apply(thisArg,args)}function arrayAggregator(array,setter,iteratee,accumulator){var index=-1,length=array==null?0:array.length;while(++index<length){var value=array[index];setter(accumulator,value,iteratee(value),array)}return accumulator}function arrayEach(array,iteratee){var index=-1,length=array==null?0:array.length;while(++index<length){if(iteratee(array[index],index,array)===false){break}}return array}function arrayEachRight(array,iteratee){var length=array==null?0:array.length;while(length--){if(iteratee(array[length],length,array)===false){break}}return array}function arrayEvery(array,predicate){var index=-1,length=array==null?0:array.length;while(++index<length){if(!predicate(array[index],index,array)){return false}}return true}function arrayFilter(array,predicate){var index=-1,length=array==null?0:array.length,resIndex=0,result=[];while(++index<length){var value=array[index];if(predicate(value,index,array)){result[resIndex++]=value}}return result}function arrayIncludes(array,value){var length=array==null?0:array.length;return!!length&&baseIndexOf(array,value,0)>-1}function arrayIncludesWith(array,value,comparator){var index=-1,length=array==null?0:array.length;while(++index<length){if(comparator(value,array[index])){return true}}return false}function arrayMap(array,iteratee){var index=-1,length=array==null?0:array.length,result=Array(length);while(++index<length){result[index]=iteratee(array[index],index,array)}return result}function arrayPush(array,values){var index=-1,length=values.length,offset=array.length;while(++index<length){array[offset+index]=values[index]}return array}function arrayReduce(array,iteratee,accumulator,initAccum){var index=-1,length=array==null?0:array.length;if(initAccum&&length){accumulator=array[++index]}while(++index<length){accumulator=iteratee(accumulator,array[index],index,array)}return accumulator}function arrayReduceRight(array,iteratee,accumulator,initAccum){var length=array==null?0:array.length;if(initAccum&&length){accumulator=array[--length]}while(length--){accumulator=iteratee(accumulator,array[length],length,array)}return accumulator}function arraySome(array,predicate){var index=-1,length=array==null?0:array.length;while(++index<length){if(predicate(array[index],index,array)){return true}}return false}var asciiSize=baseProperty("length");function asciiToArray(string){return string.split("")}function asciiWords(string){return string.match(reAsciiWord)||[]}function baseFindKey(collection,predicate,eachFunc){var result;eachFunc(collection,function(value,key,collection){if(predicate(value,key,collection)){result=key;return false}});return result}function baseFindIndex(array,predicate,fromIndex,fromRight){var length=array.length,index=fromIndex+(fromRight?1:-1);while(fromRight?index--:++index<length){if(predicate(array[index],index,array)){return index}}return-1}function baseIndexOf(array,value,fromIndex){return value===value?strictIndexOf(array,value,fromIndex):baseFindIndex(array,baseIsNaN,fromIndex)}function baseIndexOfWith(array,value,fromIndex,comparator){var index=fromIndex-1,length=array.length;while(++index<length){if(comparator(array[index],value)){return index}}return-1}function baseIsNaN(value){return value!==value}function baseMean(array,iteratee){var length=array==null?0:array.length;return length?baseSum(array,iteratee)/length:NAN}function baseProperty(key){return function(object){return object==null?undefined:object[key]}}function basePropertyOf(object){return function(key){return object==null?undefined:object[key]}}function baseReduce(collection,iteratee,accumulator,initAccum,eachFunc){eachFunc(collection,function(value,index,collection){accumulator=initAccum?(initAccum=false,value):iteratee(accumulator,value,index,collection)});return accumulator}function baseSortBy(array,comparer){var length=array.length;array.sort(comparer);while(length--){array[length]=array[length].value}return array}function baseSum(array,iteratee){var result,index=-1,length=array.length;while(++index<length){var current=iteratee(array[index]);if(current!==undefined){result=result===undefined?current:result+current}}return result}function baseTimes(n,iteratee){var index=-1,result=Array(n);while(++index<n){result[index]=iteratee(index)}return result}function baseToPairs(object,props){return arrayMap(props,function(key){return[key,object[key]]})}function baseUnary(func){return function(value){return func(value)}}function baseValues(object,props){return arrayMap(props,function(key){return object[key]})}function cacheHas(cache,key){return cache.has(key)}function charsStartIndex(strSymbols,chrSymbols){var index=-1,length=strSymbols.length;while(++index<length&&baseIndexOf(chrSymbols,strSymbols[index],0)>-1){}return index}function charsEndIndex(strSymbols,chrSymbols){var index=strSymbols.length;while(index--&&baseIndexOf(chrSymbols,strSymbols[index],0)>-1){}return index}function countHolders(array,placeholder){var length=array.length,result=0;while(length--){if(array[length]===placeholder){++result}}return result}var deburrLetter=basePropertyOf(deburredLetters);var escapeHtmlChar=basePropertyOf(htmlEscapes);function escapeStringChar(chr){return"\\"+stringEscapes[chr]}function getValue(object,key){return object==null?undefined:object[key]}function hasUnicode(string){return reHasUnicode.test(string)}function hasUnicodeWord(string){return reHasUnicodeWord.test(string)}function iteratorToArray(iterator){var data,result=[];while(!(data=iterator.next()).done){result.push(data.value)}return result}function mapToArray(map){var index=-1,result=Array(map.size);map.forEach(function(value,key){result[++index]=[key,value]});return result}function overArg(func,transform){return function(arg){return func(transform(arg))}}function replaceHolders(array,placeholder){var index=-1,length=array.length,resIndex=0,result=[];while(++index<length){var value=array[index];if(value===placeholder||value===PLACEHOLDER){array[index]=PLACEHOLDER;result[resIndex++]=index}}return result}function setToArray(set){var index=-1,result=Array(set.size);set.forEach(function(value){result[++index]=value});return result}function setToPairs(set){var index=-1,result=Array(set.size);set.forEach(function(value){result[++index]=[value,value]});return result}function strictIndexOf(array,value,fromIndex){var index=fromIndex-1,length=array.length;while(++index<length){if(array[index]===value){return index}}return-1}function strictLastIndexOf(array,value,fromIndex){var index=fromIndex+1;while(index--){if(array[index]===value){return index}}return index}function stringSize(string){return hasUnicode(string)?unicodeSize(string):asciiSize(string)}function stringToArray(string){return hasUnicode(string)?unicodeToArray(string):asciiToArray(string)}var unescapeHtmlChar=basePropertyOf(htmlUnescapes);function unicodeSize(string){var result=reUnicode.lastIndex=0;while(reUnicode.test(string)){++result}return result}function unicodeToArray(string){return string.match(reUnicode)||[]}function unicodeWords(string){return string.match(reUnicodeWord)||[]}var runInContext=function runInContext(context){context=context==null?root:_.defaults(root.Object(),context,_.pick(root,contextProps));var Array=context.Array,Date=context.Date,Error=context.Error,Function=context.Function,Math=context.Math,Object=context.Object,RegExp=context.RegExp,String=context.String,TypeError=context.TypeError;var arrayProto=Array.prototype,funcProto=Function.prototype,objectProto=Object.prototype;var coreJsData=context["__core-js_shared__"];var funcToString=funcProto.toString;var hasOwnProperty=objectProto.hasOwnProperty;var idCounter=0;var maskSrcKey=function(){var uid=/[^.]+$/.exec(coreJsData&&coreJsData.keys&&coreJsData.keys.IE_PROTO||"");return uid?"Symbol(src)_1."+uid:""}();var nativeObjectToString=objectProto.toString;var objectCtorString=funcToString.call(Object);var oldDash=root._;var reIsNative=RegExp("^"+funcToString.call(hasOwnProperty).replace(reRegExpChar,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$");var Buffer=moduleExports?context.Buffer:undefined,Symbol=context.Symbol,Uint8Array=context.Uint8Array,allocUnsafe=Buffer?Buffer.allocUnsafe:undefined,getPrototype=overArg(Object.getPrototypeOf,Object),objectCreate=Object.create,propertyIsEnumerable=objectProto.propertyIsEnumerable,splice=arrayProto.splice,spreadableSymbol=Symbol?Symbol.isConcatSpreadable:undefined,symIterator=Symbol?Symbol.iterator:undefined,symToStringTag=Symbol?Symbol.toStringTag:undefined;var defineProperty=function(){try{var func=getNative(Object,"defineProperty");func({},"",{});return func}catch(e){}}();var ctxClearTimeout=context.clearTimeout!==root.clearTimeout&&context.clearTimeout,ctxNow=Date&&Date.now!==root.Date.now&&Date.now,ctxSetTimeout=context.setTimeout!==root.setTimeout&&context.setTimeout;var nativeCeil=Math.ceil,nativeFloor=Math.floor,nativeGetSymbols=Object.getOwnPropertySymbols,nativeIsBuffer=Buffer?Buffer.isBuffer:undefined,nativeIsFinite=context.isFinite,nativeJoin=arrayProto.join,nativeKeys=overArg(Object.keys,Object),nativeMax=Math.max,nativeMin=Math.min,nativeNow=Date.now,nativeParseInt=context.parseInt,nativeRandom=Math.random,nativeReverse=arrayProto.reverse;var DataView=getNative(context,"DataView"),Map=getNative(context,"Map"),Promise=getNative(context,"Promise"),Set=getNative(context,"Set"),WeakMap=getNative(context,"WeakMap"),nativeCreate=getNative(Object,"create");var metaMap=WeakMap&&new WeakMap;var realNames={};var dataViewCtorString=toSource(DataView),mapCtorString=toSource(Map),promiseCtorString=toSource(Promise),setCtorString=toSource(Set),weakMapCtorString=toSource(WeakMap);var symbolProto=Symbol?Symbol.prototype:undefined,symbolValueOf=symbolProto?symbolProto.valueOf:undefined,symbolToString=symbolProto?symbolProto.toString:undefined;function lodash(value){if(isObjectLike(value)&&!isArray(value)&&!(value instanceof LazyWrapper)){if(value instanceof LodashWrapper){return value}if(hasOwnProperty.call(value,"__wrapped__")){return wrapperClone(value)}}return new LodashWrapper(value)}var baseCreate=function(){function object(){}return function(proto){if(!isObject(proto)){return{}}if(objectCreate){return objectCreate(proto)}object.prototype=proto;var result=new object;object.prototype=undefined;return result}}();function baseLodash(){}function LodashWrapper(value,chainAll){this.__wrapped__=value;this.__actions__=[];this.__chain__=!!chainAll;this.__index__=0;this.__values__=undefined}lodash.templateSettings={escape:reEscape,evaluate:reEvaluate,interpolate:reInterpolate,variable:"",imports:{_:lodash}};lodash.prototype=baseLodash.prototype;lodash.prototype.constructor=lodash;LodashWrapper.prototype=baseCreate(baseLodash.prototype);LodashWrapper.prototype.constructor=LodashWrapper;function LazyWrapper(value){this.__wrapped__=value;this.__actions__=[];this.__dir__=1;this.__filtered__=false;this.__iteratees__=[];this.__takeCount__=MAX_ARRAY_LENGTH;this.__views__=[]}function lazyClone(){var result=new LazyWrapper(this.__wrapped__);result.__actions__=copyArray(this.__actions__);result.__dir__=this.__dir__;result.__filtered__=this.__filtered__;result.__iteratees__=copyArray(this.__iteratees__);result.__takeCount__=this.__takeCount__;result.__views__=copyArray(this.__views__);return result}function lazyReverse(){if(this.__filtered__){var result=new LazyWrapper(this);result.__dir__=-1;result.__filtered__=true}else{result=this.clone();result.__dir__*=-1}return result}function lazyValue(){var array=this.__wrapped__.value(),dir=this.__dir__,isArr=isArray(array),isRight=dir<0,arrLength=isArr?array.length:0,view=getView(0,arrLength,this.__views__),start=view.start,end=view.end,length=end-start,index=isRight?end:start-1,iteratees=this.__iteratees__,iterLength=iteratees.length,resIndex=0,takeCount=nativeMin(length,this.__takeCount__);if(!isArr||!isRight&&arrLength==length&&takeCount==length){return baseWrapperValue(array,this.__actions__)}var result=[];outer:while(length--&&resIndex<takeCount){index+=dir;var iterIndex=-1,value=array[index];while(++iterIndex<iterLength){var data=iteratees[iterIndex],iteratee=data.iteratee,type=data.type,computed=iteratee(value);if(type==LAZY_MAP_FLAG){value=computed}else if(!computed){if(type==LAZY_FILTER_FLAG){continue outer}else{break outer}}}result[resIndex++]=value}return result}LazyWrapper.prototype=baseCreate(baseLodash.prototype);LazyWrapper.prototype.constructor=LazyWrapper;function Hash(entries){var index=-1,length=entries==null?0:entries.length;this.clear();while(++index<length){var entry=entries[index];this.set(entry[0],entry[1])}}function hashClear(){this.__data__=nativeCreate?nativeCreate(null):{};this.size=0}function hashDelete(key){var result=this.has(key)&&delete this.__data__[key];this.size-=result?1:0;return result}function hashGet(key){var data=this.__data__;if(nativeCreate){var result=data[key];return result===HASH_UNDEFINED?undefined:result}return hasOwnProperty.call(data,key)?data[key]:undefined}function hashHas(key){var data=this.__data__;return nativeCreate?data[key]!==undefined:hasOwnProperty.call(data,key)}function hashSet(key,value){var data=this.__data__;this.size+=this.has(key)?0:1;data[key]=nativeCreate&&value===undefined?HASH_UNDEFINED:value;return this}Hash.prototype.clear=hashClear;Hash.prototype["delete"]=hashDelete;Hash.prototype.get=hashGet;Hash.prototype.has=hashHas;Hash.prototype.set=hashSet;function ListCache(entries){var index=-1,length=entries==null?0:entries.length;this.clear();while(++index<length){var entry=entries[index];this.set(entry[0],entry[1])}}function listCacheClear(){this.__data__=[];this.size=0}function listCacheDelete(key){var data=this.__data__,index=assocIndexOf(data,key);if(index<0){return false}var lastIndex=data.length-1;if(index==lastIndex){data.pop()}else{splice.call(data,index,1)}--this.size;return true}function listCacheGet(key){var data=this.__data__,index=assocIndexOf(data,key);return index<0?undefined:data[index][1]}function listCacheHas(key){return assocIndexOf(this.__data__,key)>-1}function listCacheSet(key,value){var data=this.__data__,index=assocIndexOf(data,key);if(index<0){++this.size;data.push([key,value])}else{data[index][1]=value}return this}ListCache.prototype.clear=listCacheClear;ListCache.prototype["delete"]=listCacheDelete;ListCache.prototype.get=listCacheGet;ListCache.prototype.has=listCacheHas;ListCache.prototype.set=listCacheSet;function MapCache(entries){var index=-1,length=entries==null?0:entries.length;this.clear();while(++index<length){var entry=entries[index];this.set(entry[0],entry[1])}}function mapCacheClear(){this.size=0;this.__data__={hash:new Hash,map:new(Map||ListCache),string:new Hash}}function mapCacheDelete(key){var result=getMapData(this,key)["delete"](key);this.size-=result?1:0;return result}function mapCacheGet(key){return getMapData(this,key).get(key)}function mapCacheHas(key){return getMapData(this,key).has(key)}function mapCacheSet(key,value){var data=getMapData(this,key),size=data.size;data.set(key,value);this.size+=data.size==size?0:1;return this}MapCache.prototype.clear=mapCacheClear;MapCache.prototype["delete"]=mapCacheDelete;MapCache.prototype.get=mapCacheGet;MapCache.prototype.has=mapCacheHas;MapCache.prototype.set=mapCacheSet;function SetCache(values){var index=-1,length=values==null?0:values.length;this.__data__=new MapCache;while(++index<length){this.add(values[index])}}function setCacheAdd(value){this.__data__.set(value,HASH_UNDEFINED);return this}function setCacheHas(value){return this.__data__.has(value)}SetCache.prototype.add=SetCache.prototype.push=setCacheAdd;SetCache.prototype.has=setCacheHas;function Stack(entries){var data=this.__data__=new ListCache(entries);this.size=data.size}function stackClear(){this.__data__=new ListCache;this.size=0}function stackDelete(key){var data=this.__data__,result=data["delete"](key);this.size=data.size;return result}function stackGet(key){return this.__data__.get(key)}function stackHas(key){return this.__data__.has(key)}function stackSet(key,value){var data=this.__data__;if(data instanceof ListCache){var pairs=data.__data__;if(!Map||pairs.length<LARGE_ARRAY_SIZE-1){pairs.push([key,value]);this.size=++data.size;return this}data=this.__data__=new MapCache(pairs)}data.set(key,value);this.size=data.size;return this}Stack.prototype.clear=stackClear;Stack.prototype["delete"]=stackDelete;Stack.prototype.get=stackGet;Stack.prototype.has=stackHas;Stack.prototype.set=stackSet;function arrayLikeKeys(value,inherited){var isArr=isArray(value),isArg=!isArr&&isArguments(value),isBuff=!isArr&&!isArg&&isBuffer(value),isType=!isArr&&!isArg&&!isBuff&&isTypedArray(value),skipIndexes=isArr||isArg||isBuff||isType,result=skipIndexes?baseTimes(value.length,String):[],length=result.length;for(var key in value){if((inherited||hasOwnProperty.call(value,key))&&!(skipIndexes&&(key=="length"||isBuff&&(key=="offset"||key=="parent")||isType&&(key=="buffer"||key=="byteLength"||key=="byteOffset")||isIndex(key,length)))){result.push(key)}}return result}function arraySample(array){var length=array.length;return length?array[baseRandom(0,length-1)]:undefined}function arraySampleSize(array,n){return shuffleSelf(copyArray(array),baseClamp(n,0,array.length))}function arrayShuffle(array){return shuffleSelf(copyArray(array))}function assignMergeValue(object,key,value){if(value!==undefined&&!eq(object[key],value)||value===undefined&&!(key in object)){baseAssignValue(object,key,value)}}function assignValue(object,key,value){var objValue=object[key];if(!(hasOwnProperty.call(object,key)&&eq(objValue,value))||value===undefined&&!(key in object)){baseAssignValue(object,key,value)}}function assocIndexOf(array,key){var length=array.length;while(length--){if(eq(array[length][0],key)){return length}}return-1}function baseAggregator(collection,setter,iteratee,accumulator){baseEach(collection,function(value,key,collection){setter(accumulator,value,iteratee(value),collection)});return accumulator}function baseAssign(object,source){return object&&copyObject(source,keys(source),object)}function baseAssignIn(object,source){return object&&copyObject(source,keysIn(source),object)}function baseAssignValue(object,key,value){if(key=="__proto__"&&defineProperty){defineProperty(object,key,{configurable:true,enumerable:true,value:value,writable:true})}else{object[key]=value}}function baseAt(object,paths){var index=-1,length=paths.length,result=Array(length),skip=object==null;while(++index<length){result[index]=skip?undefined:get(object,paths[index])}return result}function baseClamp(number,lower,upper){if(number===number){if(upper!==undefined){number=number<=upper?number:upper}if(lower!==undefined){number=number>=lower?number:lower}}return number}function baseClone(value,bitmask,customizer,key,object,stack){var result,isDeep=bitmask&CLONE_DEEP_FLAG,isFlat=bitmask&CLONE_FLAT_FLAG,isFull=bitmask&CLONE_SYMBOLS_FLAG;if(customizer){result=object?customizer(value,key,object,stack):customizer(value)}if(result!==undefined){return result}if(!isObject(value)){return value}var isArr=isArray(value);if(isArr){result=initCloneArray(value);if(!isDeep){return copyArray(value,result)}}else{var tag=getTag(value),isFunc=tag==funcTag||tag==genTag;if(isBuffer(value)){return cloneBuffer(value,isDeep)}if(tag==objectTag||tag==argsTag||isFunc&&!object){result=isFlat||isFunc?{}:initCloneObject(value);if(!isDeep){return isFlat?copySymbolsIn(value,baseAssignIn(result,value)):copySymbols(value,baseAssign(result,value))}}else{if(!cloneableTags[tag]){return object?value:{}}result=initCloneByTag(value,tag,baseClone,isDeep)}}stack||(stack=new Stack);var stacked=stack.get(value);if(stacked){return stacked}stack.set(value,result);var keysFunc=isFull?isFlat?getAllKeysIn:getAllKeys:isFlat?keysIn:keys;var props=isArr?undefined:keysFunc(value);arrayEach(props||value,function(subValue,key){if(props){key=subValue;subValue=value[key]}assignValue(result,key,baseClone(subValue,bitmask,customizer,key,value,stack))});return result}function baseConforms(source){var props=keys(source);return function(object){return baseConformsTo(object,source,props)}}function baseConformsTo(object,source,props){var length=props.length;if(object==null){return!length}object=Object(object);while(length--){var key=props[length],predicate=source[key],value=object[key];if(value===undefined&&!(key in object)||!predicate(value)){return false}}return true}function baseDelay(func,wait,args){if(typeof func!="function"){throw new TypeError(FUNC_ERROR_TEXT)}return setTimeout(function(){func.apply(undefined,args)},wait)}function baseDifference(array,values,iteratee,comparator){var index=-1,includes=arrayIncludes,isCommon=true,length=array.length,result=[],valuesLength=values.length;
if(!length){return result}if(iteratee){values=arrayMap(values,baseUnary(iteratee))}if(comparator){includes=arrayIncludesWith;isCommon=false}else if(values.length>=LARGE_ARRAY_SIZE){includes=cacheHas;isCommon=false;values=new SetCache(values)}outer:while(++index<length){var value=array[index],computed=iteratee==null?value:iteratee(value);value=comparator||value!==0?value:0;if(isCommon&&computed===computed){var valuesIndex=valuesLength;while(valuesIndex--){if(values[valuesIndex]===computed){continue outer}}result.push(value)}else if(!includes(values,computed,comparator)){result.push(value)}}return result}var baseEach=createBaseEach(baseForOwn);var baseEachRight=createBaseEach(baseForOwnRight,true);function baseEvery(collection,predicate){var result=true;baseEach(collection,function(value,index,collection){result=!!predicate(value,index,collection);return result});return result}function baseExtremum(array,iteratee,comparator){var index=-1,length=array.length;while(++index<length){var value=array[index],current=iteratee(value);if(current!=null&&(computed===undefined?current===current&&!isSymbol(current):comparator(current,computed))){var computed=current,result=value}}return result}function baseFill(array,value,start,end){var length=array.length;start=toInteger(start);if(start<0){start=-start>length?0:length+start}end=end===undefined||end>length?length:toInteger(end);if(end<0){end+=length}end=start>end?0:toLength(end);while(start<end){array[start++]=value}return array}function baseFilter(collection,predicate){var result=[];baseEach(collection,function(value,index,collection){if(predicate(value,index,collection)){result.push(value)}});return result}function baseFlatten(array,depth,predicate,isStrict,result){var index=-1,length=array.length;predicate||(predicate=isFlattenable);result||(result=[]);while(++index<length){var value=array[index];if(depth>0&&predicate(value)){if(depth>1){baseFlatten(value,depth-1,predicate,isStrict,result)}else{arrayPush(result,value)}}else if(!isStrict){result[result.length]=value}}return result}var baseFor=createBaseFor();var baseForRight=createBaseFor(true);function baseForOwn(object,iteratee){return object&&baseFor(object,iteratee,keys)}function baseForOwnRight(object,iteratee){return object&&baseForRight(object,iteratee,keys)}function baseFunctions(object,props){return arrayFilter(props,function(key){return isFunction(object[key])})}function baseGet(object,path){path=castPath(path,object);var index=0,length=path.length;while(object!=null&&index<length){object=object[toKey(path[index++])]}return index&&index==length?object:undefined}function baseGetAllKeys(object,keysFunc,symbolsFunc){var result=keysFunc(object);return isArray(object)?result:arrayPush(result,symbolsFunc(object))}function baseGetTag(value){if(value==null){return value===undefined?undefinedTag:nullTag}return symToStringTag&&symToStringTag in Object(value)?getRawTag(value):objectToString(value)}function baseGt(value,other){return value>other}function baseHas(object,key){return object!=null&&hasOwnProperty.call(object,key)}function baseHasIn(object,key){return object!=null&&key in Object(object)}function baseInRange(number,start,end){return number>=nativeMin(start,end)&&number<nativeMax(start,end)}function baseIntersection(arrays,iteratee,comparator){var includes=comparator?arrayIncludesWith:arrayIncludes,length=arrays[0].length,othLength=arrays.length,othIndex=othLength,caches=Array(othLength),maxLength=Infinity,result=[];while(othIndex--){var array=arrays[othIndex];if(othIndex&&iteratee){array=arrayMap(array,baseUnary(iteratee))}maxLength=nativeMin(array.length,maxLength);caches[othIndex]=!comparator&&(iteratee||length>=120&&array.length>=120)?new SetCache(othIndex&&array):undefined}array=arrays[0];var index=-1,seen=caches[0];outer:while(++index<length&&result.length<maxLength){var value=array[index],computed=iteratee?iteratee(value):value;value=comparator||value!==0?value:0;if(!(seen?cacheHas(seen,computed):includes(result,computed,comparator))){othIndex=othLength;while(--othIndex){var cache=caches[othIndex];if(!(cache?cacheHas(cache,computed):includes(arrays[othIndex],computed,comparator))){continue outer}}if(seen){seen.push(computed)}result.push(value)}}return result}function baseInverter(object,setter,iteratee,accumulator){baseForOwn(object,function(value,key,object){setter(accumulator,iteratee(value),key,object)});return accumulator}function baseInvoke(object,path,args){path=castPath(path,object);object=parent(object,path);var func=object==null?object:object[toKey(last(path))];return func==null?undefined:apply(func,object,args)}function baseIsArguments(value){return isObjectLike(value)&&baseGetTag(value)==argsTag}function baseIsArrayBuffer(value){return isObjectLike(value)&&baseGetTag(value)==arrayBufferTag}function baseIsDate(value){return isObjectLike(value)&&baseGetTag(value)==dateTag}function baseIsEqual(value,other,bitmask,customizer,stack){if(value===other){return true}if(value==null||other==null||!isObjectLike(value)&&!isObjectLike(other)){return value!==value&&other!==other}return baseIsEqualDeep(value,other,bitmask,customizer,baseIsEqual,stack)}function baseIsEqualDeep(object,other,bitmask,customizer,equalFunc,stack){var objIsArr=isArray(object),othIsArr=isArray(other),objTag=objIsArr?arrayTag:getTag(object),othTag=othIsArr?arrayTag:getTag(other);objTag=objTag==argsTag?objectTag:objTag;othTag=othTag==argsTag?objectTag:othTag;var objIsObj=objTag==objectTag,othIsObj=othTag==objectTag,isSameTag=objTag==othTag;if(isSameTag&&isBuffer(object)){if(!isBuffer(other)){return false}objIsArr=true;objIsObj=false}if(isSameTag&&!objIsObj){stack||(stack=new Stack);return objIsArr||isTypedArray(object)?equalArrays(object,other,bitmask,customizer,equalFunc,stack):equalByTag(object,other,objTag,bitmask,customizer,equalFunc,stack)}if(!(bitmask&COMPARE_PARTIAL_FLAG)){var objIsWrapped=objIsObj&&hasOwnProperty.call(object,"__wrapped__"),othIsWrapped=othIsObj&&hasOwnProperty.call(other,"__wrapped__");if(objIsWrapped||othIsWrapped){var objUnwrapped=objIsWrapped?object.value():object,othUnwrapped=othIsWrapped?other.value():other;stack||(stack=new Stack);return equalFunc(objUnwrapped,othUnwrapped,bitmask,customizer,stack)}}if(!isSameTag){return false}stack||(stack=new Stack);return equalObjects(object,other,bitmask,customizer,equalFunc,stack)}function baseIsMap(value){return isObjectLike(value)&&getTag(value)==mapTag}function baseIsMatch(object,source,matchData,customizer){var index=matchData.length,length=index,noCustomizer=!customizer;if(object==null){return!length}object=Object(object);while(index--){var data=matchData[index];if(noCustomizer&&data[2]?data[1]!==object[data[0]]:!(data[0]in object)){return false}}while(++index<length){data=matchData[index];var key=data[0],objValue=object[key],srcValue=data[1];if(noCustomizer&&data[2]){if(objValue===undefined&&!(key in object)){return false}}else{var stack=new Stack;if(customizer){var result=customizer(objValue,srcValue,key,object,source,stack)}if(!(result===undefined?baseIsEqual(srcValue,objValue,COMPARE_PARTIAL_FLAG|COMPARE_UNORDERED_FLAG,customizer,stack):result)){return false}}}return true}function baseIsNative(value){if(!isObject(value)||isMasked(value)){return false}var pattern=isFunction(value)?reIsNative:reIsHostCtor;return pattern.test(toSource(value))}function baseIsRegExp(value){return isObjectLike(value)&&baseGetTag(value)==regexpTag}function baseIsSet(value){return isObjectLike(value)&&getTag(value)==setTag}function baseIsTypedArray(value){return isObjectLike(value)&&isLength(value.length)&&!!typedArrayTags[baseGetTag(value)]}function baseIteratee(value){if(typeof value=="function"){return value}if(value==null){return identity}if(typeof value=="object"){return isArray(value)?baseMatchesProperty(value[0],value[1]):baseMatches(value)}return property(value)}function baseKeys(object){if(!isPrototype(object)){return nativeKeys(object)}var result=[];for(var key in Object(object)){if(hasOwnProperty.call(object,key)&&key!="constructor"){result.push(key)}}return result}function baseKeysIn(object){if(!isObject(object)){return nativeKeysIn(object)}var isProto=isPrototype(object),result=[];for(var key in object){if(!(key=="constructor"&&(isProto||!hasOwnProperty.call(object,key)))){result.push(key)}}return result}function baseLt(value,other){return value<other}function baseMap(collection,iteratee){var index=-1,result=isArrayLike(collection)?Array(collection.length):[];baseEach(collection,function(value,key,collection){result[++index]=iteratee(value,key,collection)});return result}function baseMatches(source){var matchData=getMatchData(source);if(matchData.length==1&&matchData[0][2]){return matchesStrictComparable(matchData[0][0],matchData[0][1])}return function(object){return object===source||baseIsMatch(object,source,matchData)}}function baseMatchesProperty(path,srcValue){if(isKey(path)&&isStrictComparable(srcValue)){return matchesStrictComparable(toKey(path),srcValue)}return function(object){var objValue=get(object,path);return objValue===undefined&&objValue===srcValue?hasIn(object,path):baseIsEqual(srcValue,objValue,COMPARE_PARTIAL_FLAG|COMPARE_UNORDERED_FLAG)}}function baseMerge(object,source,srcIndex,customizer,stack){if(object===source){return}baseFor(source,function(srcValue,key){if(isObject(srcValue)){stack||(stack=new Stack);baseMergeDeep(object,source,key,srcIndex,baseMerge,customizer,stack)}else{var newValue=customizer?customizer(object[key],srcValue,key+"",object,source,stack):undefined;if(newValue===undefined){newValue=srcValue}assignMergeValue(object,key,newValue)}},keysIn)}function baseMergeDeep(object,source,key,srcIndex,mergeFunc,customizer,stack){var objValue=object[key],srcValue=source[key],stacked=stack.get(srcValue);if(stacked){assignMergeValue(object,key,stacked);return}var newValue=customizer?customizer(objValue,srcValue,key+"",object,source,stack):undefined;var isCommon=newValue===undefined;if(isCommon){var isArr=isArray(srcValue),isBuff=!isArr&&isBuffer(srcValue),isTyped=!isArr&&!isBuff&&isTypedArray(srcValue);newValue=srcValue;if(isArr||isBuff||isTyped){if(isArray(objValue)){newValue=objValue}else if(isArrayLikeObject(objValue)){newValue=copyArray(objValue)}else if(isBuff){isCommon=false;newValue=cloneBuffer(srcValue,true)}else if(isTyped){isCommon=false;newValue=cloneTypedArray(srcValue,true)}else{newValue=[]}}else if(isPlainObject(srcValue)||isArguments(srcValue)){newValue=objValue;if(isArguments(objValue)){newValue=toPlainObject(objValue)}else if(!isObject(objValue)||srcIndex&&isFunction(objValue)){newValue=initCloneObject(srcValue)}}else{isCommon=false}}if(isCommon){stack.set(srcValue,newValue);mergeFunc(newValue,srcValue,srcIndex,customizer,stack);stack["delete"](srcValue)}assignMergeValue(object,key,newValue)}function baseNth(array,n){var length=array.length;if(!length){return}n+=n<0?length:0;return isIndex(n,length)?array[n]:undefined}function baseOrderBy(collection,iteratees,orders){var index=-1;iteratees=arrayMap(iteratees.length?iteratees:[identity],baseUnary(getIteratee()));var result=baseMap(collection,function(value,key,collection){var criteria=arrayMap(iteratees,function(iteratee){return iteratee(value)});return{criteria:criteria,index:++index,value:value}});return baseSortBy(result,function(object,other){return compareMultiple(object,other,orders)})}function basePick(object,paths){return basePickBy(object,paths,function(value,path){return hasIn(object,path)})}function basePickBy(object,paths,predicate){var index=-1,length=paths.length,result={};while(++index<length){var path=paths[index],value=baseGet(object,path);if(predicate(value,path)){baseSet(result,castPath(path,object),value)}}return result}function basePropertyDeep(path){return function(object){return baseGet(object,path)}}function basePullAll(array,values,iteratee,comparator){var indexOf=comparator?baseIndexOfWith:baseIndexOf,index=-1,length=values.length,seen=array;if(array===values){values=copyArray(values)}if(iteratee){seen=arrayMap(array,baseUnary(iteratee))}while(++index<length){var fromIndex=0,value=values[index],computed=iteratee?iteratee(value):value;while((fromIndex=indexOf(seen,computed,fromIndex,comparator))>-1){if(seen!==array){splice.call(seen,fromIndex,1)}splice.call(array,fromIndex,1)}}return array}function basePullAt(array,indexes){var length=array?indexes.length:0,lastIndex=length-1;while(length--){var index=indexes[length];if(length==lastIndex||index!==previous){var previous=index;if(isIndex(index)){splice.call(array,index,1)}else{baseUnset(array,index)}}}return array}function baseRandom(lower,upper){return lower+nativeFloor(nativeRandom()*(upper-lower+1))}function baseRange(start,end,step,fromRight){var index=-1,length=nativeMax(nativeCeil((end-start)/(step||1)),0),result=Array(length);while(length--){result[fromRight?length:++index]=start;start+=step}return result}function baseRepeat(string,n){var result="";if(!string||n<1||n>MAX_SAFE_INTEGER){return result}do{if(n%2){result+=string}n=nativeFloor(n/2);if(n){string+=string}}while(n);return result}function baseRest(func,start){return setToString(overRest(func,start,identity),func+"")}function baseSample(collection){return arraySample(values(collection))}function baseSampleSize(collection,n){var array=values(collection);return shuffleSelf(array,baseClamp(n,0,array.length))}function baseSet(object,path,value,customizer){if(!isObject(object)){return object}path=castPath(path,object);var index=-1,length=path.length,lastIndex=length-1,nested=object;while(nested!=null&&++index<length){var key=toKey(path[index]),newValue=value;if(index!=lastIndex){var objValue=nested[key];newValue=customizer?customizer(objValue,key,nested):undefined;if(newValue===undefined){newValue=isObject(objValue)?objValue:isIndex(path[index+1])?[]:{}}}assignValue(nested,key,newValue);nested=nested[key]}return object}var baseSetData=!metaMap?identity:function(func,data){metaMap.set(func,data);return func};var baseSetToString=!defineProperty?identity:function(func,string){return defineProperty(func,"toString",{configurable:true,enumerable:false,value:constant(string),writable:true})};function baseShuffle(collection){return shuffleSelf(values(collection))}function baseSlice(array,start,end){var index=-1,length=array.length;if(start<0){start=-start>length?0:length+start}end=end>length?length:end;if(end<0){end+=length}length=start>end?0:end-start>>>0;start>>>=0;var result=Array(length);while(++index<length){result[index]=array[index+start]}return result}function baseSome(collection,predicate){var result;baseEach(collection,function(value,index,collection){result=predicate(value,index,collection);return!result});return!!result}function baseSortedIndex(array,value,retHighest){var low=0,high=array==null?low:array.length;if(typeof value=="number"&&value===value&&high<=HALF_MAX_ARRAY_LENGTH){while(low<high){var mid=low+high>>>1,computed=array[mid];if(computed!==null&&!isSymbol(computed)&&(retHighest?computed<=value:computed<value)){low=mid+1}else{high=mid}}return high}return baseSortedIndexBy(array,value,identity,retHighest)}function baseSortedIndexBy(array,value,iteratee,retHighest){value=iteratee(value);var low=0,high=array==null?0:array.length,valIsNaN=value!==value,valIsNull=value===null,valIsSymbol=isSymbol(value),valIsUndefined=value===undefined;while(low<high){var mid=nativeFloor((low+high)/2),computed=iteratee(array[mid]),othIsDefined=computed!==undefined,othIsNull=computed===null,othIsReflexive=computed===computed,othIsSymbol=isSymbol(computed);if(valIsNaN){var setLow=retHighest||othIsReflexive}else if(valIsUndefined){setLow=othIsReflexive&&(retHighest||othIsDefined)}else if(valIsNull){setLow=othIsReflexive&&othIsDefined&&(retHighest||!othIsNull)}else if(valIsSymbol){setLow=othIsReflexive&&othIsDefined&&!othIsNull&&(retHighest||!othIsSymbol)}else if(othIsNull||othIsSymbol){setLow=false}else{setLow=retHighest?computed<=value:computed<value}if(setLow){low=mid+1}else{high=mid}}return nativeMin(high,MAX_ARRAY_INDEX)}function baseSortedUniq(array,iteratee){var index=-1,length=array.length,resIndex=0,result=[];while(++index<length){var value=array[index],computed=iteratee?iteratee(value):value;if(!index||!eq(computed,seen)){var seen=computed;result[resIndex++]=value===0?0:value}}return result}function baseToNumber(value){if(typeof value=="number"){return value}if(isSymbol(value)){return NAN}return+value}function baseToString(value){if(typeof value=="string"){return value}if(isArray(value)){return arrayMap(value,baseToString)+""}if(isSymbol(value)){return symbolToString?symbolToString.call(value):""}var result=value+"";return result=="0"&&1/value==-INFINITY?"-0":result}function baseUniq(array,iteratee,comparator){var index=-1,includes=arrayIncludes,length=array.length,isCommon=true,result=[],seen=result;if(comparator){isCommon=false;includes=arrayIncludesWith}else if(length>=LARGE_ARRAY_SIZE){var set=iteratee?null:createSet(array);if(set){return setToArray(set)}isCommon=false;includes=cacheHas;seen=new SetCache}else{seen=iteratee?[]:result}outer:while(++index<length){var value=array[index],computed=iteratee?iteratee(value):value;value=comparator||value!==0?value:0;if(isCommon&&computed===computed){var seenIndex=seen.length;while(seenIndex--){if(seen[seenIndex]===computed){continue outer}}if(iteratee){seen.push(computed)}result.push(value)}else if(!includes(seen,computed,comparator)){if(seen!==result){seen.push(computed)}result.push(value)}}return result}function baseUnset(object,path){path=castPath(path,object);object=parent(object,path);return object==null||delete object[toKey(last(path))]}function baseUpdate(object,path,updater,customizer){return baseSet(object,path,updater(baseGet(object,path)),customizer)}function baseWhile(array,predicate,isDrop,fromRight){var length=array.length,index=fromRight?length:-1;while((fromRight?index--:++index<length)&&predicate(array[index],index,array)){}return isDrop?baseSlice(array,fromRight?0:index,fromRight?index+1:length):baseSlice(array,fromRight?index+1:0,fromRight?length:index)}function baseWrapperValue(value,actions){var result=value;if(result instanceof LazyWrapper){result=result.value()}return arrayReduce(actions,function(result,action){return action.func.apply(action.thisArg,arrayPush([result],action.args))},result)}function baseXor(arrays,iteratee,comparator){var length=arrays.length;if(length<2){return length?baseUniq(arrays[0]):[]}var index=-1,result=Array(length);while(++index<length){var array=arrays[index],othIndex=-1;while(++othIndex<length){if(othIndex!=index){result[index]=baseDifference(result[index]||array,arrays[othIndex],iteratee,comparator)}}}return baseUniq(baseFlatten(result,1),iteratee,comparator)}function baseZipObject(props,values,assignFunc){var index=-1,length=props.length,valsLength=values.length,result={};while(++index<length){var value=index<valsLength?values[index]:undefined;assignFunc(result,props[index],value)}return result}function castArrayLikeObject(value){return isArrayLikeObject(value)?value:[]}function castFunction(value){return typeof value=="function"?value:identity}function castPath(value,object){if(isArray(value)){return value}return isKey(value,object)?[value]:stringToPath(toString(value))}var castRest=baseRest;function castSlice(array,start,end){var length=array.length;end=end===undefined?length:end;return!start&&end>=length?array:baseSlice(array,start,end)}var clearTimeout=ctxClearTimeout||function(id){return root.clearTimeout(id)};function cloneBuffer(buffer,isDeep){if(isDeep){return buffer.slice()}var length=buffer.length,result=allocUnsafe?allocUnsafe(length):new buffer.constructor(length);buffer.copy(result);return result}function cloneArrayBuffer(arrayBuffer){var result=new arrayBuffer.constructor(arrayBuffer.byteLength);new Uint8Array(result).set(new Uint8Array(arrayBuffer));return result}function cloneDataView(dataView,isDeep){var buffer=isDeep?cloneArrayBuffer(dataView.buffer):dataView.buffer;return new dataView.constructor(buffer,dataView.byteOffset,dataView.byteLength)}function cloneMap(map,isDeep,cloneFunc){var array=isDeep?cloneFunc(mapToArray(map),CLONE_DEEP_FLAG):mapToArray(map);return arrayReduce(array,addMapEntry,new map.constructor)}function cloneRegExp(regexp){var result=new regexp.constructor(regexp.source,reFlags.exec(regexp));result.lastIndex=regexp.lastIndex;return result}function cloneSet(set,isDeep,cloneFunc){var array=isDeep?cloneFunc(setToArray(set),CLONE_DEEP_FLAG):setToArray(set);return arrayReduce(array,addSetEntry,new set.constructor)}function cloneSymbol(symbol){return symbolValueOf?Object(symbolValueOf.call(symbol)):{}}function cloneTypedArray(typedArray,isDeep){var buffer=isDeep?cloneArrayBuffer(typedArray.buffer):typedArray.buffer;return new typedArray.constructor(buffer,typedArray.byteOffset,typedArray.length)}function compareAscending(value,other){if(value!==other){var valIsDefined=value!==undefined,valIsNull=value===null,valIsReflexive=value===value,valIsSymbol=isSymbol(value);var othIsDefined=other!==undefined,othIsNull=other===null,othIsReflexive=other===other,othIsSymbol=isSymbol(other);if(!othIsNull&&!othIsSymbol&&!valIsSymbol&&value>other||valIsSymbol&&othIsDefined&&othIsReflexive&&!othIsNull&&!othIsSymbol||valIsNull&&othIsDefined&&othIsReflexive||!valIsDefined&&othIsReflexive||!valIsReflexive){return 1}if(!valIsNull&&!valIsSymbol&&!othIsSymbol&&value<other||othIsSymbol&&valIsDefined&&valIsReflexive&&!valIsNull&&!valIsSymbol||othIsNull&&valIsDefined&&valIsReflexive||!othIsDefined&&valIsReflexive||!othIsReflexive){return-1}}return 0}function compareMultiple(object,other,orders){var index=-1,objCriteria=object.criteria,othCriteria=other.criteria,length=objCriteria.length,ordersLength=orders.length;while(++index<length){var result=compareAscending(objCriteria[index],othCriteria[index]);if(result){if(index>=ordersLength){return result}var order=orders[index];return result*(order=="desc"?-1:1)}}return object.index-other.index}function composeArgs(args,partials,holders,isCurried){var argsIndex=-1,argsLength=args.length,holdersLength=holders.length,leftIndex=-1,leftLength=partials.length,rangeLength=nativeMax(argsLength-holdersLength,0),result=Array(leftLength+rangeLength),isUncurried=!isCurried;while(++leftIndex<leftLength){result[leftIndex]=partials[leftIndex]}while(++argsIndex<holdersLength){if(isUncurried||argsIndex<argsLength){result[holders[argsIndex]]=args[argsIndex]}}while(rangeLength--){result[leftIndex++]=args[argsIndex++]}return result}function composeArgsRight(args,partials,holders,isCurried){var argsIndex=-1,argsLength=args.length,holdersIndex=-1,holdersLength=holders.length,rightIndex=-1,rightLength=partials.length,rangeLength=nativeMax(argsLength-holdersLength,0),result=Array(rangeLength+rightLength),isUncurried=!isCurried;while(++argsIndex<rangeLength){result[argsIndex]=args[argsIndex]}var offset=argsIndex;while(++rightIndex<rightLength){result[offset+rightIndex]=partials[rightIndex]}while(++holdersIndex<holdersLength){if(isUncurried||argsIndex<argsLength){result[offset+holders[holdersIndex]]=args[argsIndex++]}}return result}function copyArray(source,array){var index=-1,length=source.length;array||(array=Array(length));while(++index<length){array[index]=source[index]}return array}function copyObject(source,props,object,customizer){var isNew=!object;object||(object={});var index=-1,length=props.length;while(++index<length){var key=props[index];var newValue=customizer?customizer(object[key],source[key],key,object,source):undefined;if(newValue===undefined){newValue=source[key]}if(isNew){baseAssignValue(object,key,newValue)}else{assignValue(object,key,newValue)}}return object}function copySymbols(source,object){return copyObject(source,getSymbols(source),object)}function copySymbolsIn(source,object){return copyObject(source,getSymbolsIn(source),object)}function createAggregator(setter,initializer){return function(collection,iteratee){var func=isArray(collection)?arrayAggregator:baseAggregator,accumulator=initializer?initializer():{};return func(collection,setter,getIteratee(iteratee,2),accumulator)}}function createAssigner(assigner){return baseRest(function(object,sources){var index=-1,length=sources.length,customizer=length>1?sources[length-1]:undefined,guard=length>2?sources[2]:undefined;customizer=assigner.length>3&&typeof customizer=="function"?(length--,customizer):undefined;if(guard&&isIterateeCall(sources[0],sources[1],guard)){customizer=length<3?undefined:customizer;length=1}object=Object(object);while(++index<length){var source=sources[index];if(source){assigner(object,source,index,customizer)}}return object})}function createBaseEach(eachFunc,fromRight){return function(collection,iteratee){if(collection==null){return collection}if(!isArrayLike(collection)){return eachFunc(collection,iteratee)}var length=collection.length,index=fromRight?length:-1,iterable=Object(collection);while(fromRight?index--:++index<length){if(iteratee(iterable[index],index,iterable)===false){break}}return collection}}function createBaseFor(fromRight){return function(object,iteratee,keysFunc){var index=-1,iterable=Object(object),props=keysFunc(object),length=props.length;while(length--){var key=props[fromRight?length:++index];if(iteratee(iterable[key],key,iterable)===false){break}}return object}}function createBind(func,bitmask,thisArg){var isBind=bitmask&WRAP_BIND_FLAG,Ctor=createCtor(func);function wrapper(){var fn=this&&this!==root&&this instanceof wrapper?Ctor:func;return fn.apply(isBind?thisArg:this,arguments)}return wrapper}function createCaseFirst(methodName){return function(string){string=toString(string);var strSymbols=hasUnicode(string)?stringToArray(string):undefined;var chr=strSymbols?strSymbols[0]:string.charAt(0);var trailing=strSymbols?castSlice(strSymbols,1).join(""):string.slice(1);return chr[methodName]()+trailing}}function createCompounder(callback){return function(string){return arrayReduce(words(deburr(string).replace(reApos,"")),callback,"")}}function createCtor(Ctor){return function(){var args=arguments;switch(args.length){case 0:return new Ctor;case 1:return new Ctor(args[0]);case 2:return new Ctor(args[0],args[1]);case 3:return new Ctor(args[0],args[1],args[2]);case 4:return new Ctor(args[0],args[1],args[2],args[3]);case 5:return new Ctor(args[0],args[1],args[2],args[3],args[4]);case 6:return new Ctor(args[0],args[1],args[2],args[3],args[4],args[5]);case 7:return new Ctor(args[0],args[1],args[2],args[3],args[4],args[5],args[6])}var thisBinding=baseCreate(Ctor.prototype),result=Ctor.apply(thisBinding,args);return isObject(result)?result:thisBinding}}function createCurry(func,bitmask,arity){var Ctor=createCtor(func);function wrapper(){var length=arguments.length,args=Array(length),index=length,placeholder=getHolder(wrapper);while(index--){args[index]=arguments[index]}var holders=length<3&&args[0]!==placeholder&&args[length-1]!==placeholder?[]:replaceHolders(args,placeholder);length-=holders.length;if(length<arity){return createRecurry(func,bitmask,createHybrid,wrapper.placeholder,undefined,args,holders,undefined,undefined,arity-length)}var fn=this&&this!==root&&this instanceof wrapper?Ctor:func;return apply(fn,this,args)}return wrapper}function createFind(findIndexFunc){return function(collection,predicate,fromIndex){var iterable=Object(collection);if(!isArrayLike(collection)){var iteratee=getIteratee(predicate,3);collection=keys(collection);predicate=function(key){return iteratee(iterable[key],key,iterable)}}var index=findIndexFunc(collection,predicate,fromIndex);return index>-1?iterable[iteratee?collection[index]:index]:undefined}}function createFlow(fromRight){return flatRest(function(funcs){var length=funcs.length,index=length,prereq=LodashWrapper.prototype.thru;if(fromRight){funcs.reverse()}while(index--){var func=funcs[index];if(typeof func!="function"){throw new TypeError(FUNC_ERROR_TEXT)}if(prereq&&!wrapper&&getFuncName(func)=="wrapper"){var wrapper=new LodashWrapper([],true)}}index=wrapper?index:length;while(++index<length){func=funcs[index];var funcName=getFuncName(func),data=funcName=="wrapper"?getData(func):undefined;if(data&&isLaziable(data[0])&&data[1]==(WRAP_ARY_FLAG|WRAP_CURRY_FLAG|WRAP_PARTIAL_FLAG|WRAP_REARG_FLAG)&&!data[4].length&&data[9]==1){wrapper=wrapper[getFuncName(data[0])].apply(wrapper,data[3])}else{wrapper=func.length==1&&isLaziable(func)?wrapper[funcName]():wrapper.thru(func)}}return function(){var args=arguments,value=args[0];if(wrapper&&args.length==1&&isArray(value)){return wrapper.plant(value).value()}var index=0,result=length?funcs[index].apply(this,args):value;while(++index<length){result=funcs[index].call(this,result)}return result}})}function createHybrid(func,bitmask,thisArg,partials,holders,partialsRight,holdersRight,argPos,ary,arity){var isAry=bitmask&WRAP_ARY_FLAG,isBind=bitmask&WRAP_BIND_FLAG,isBindKey=bitmask&WRAP_BIND_KEY_FLAG,isCurried=bitmask&(WRAP_CURRY_FLAG|WRAP_CURRY_RIGHT_FLAG),isFlip=bitmask&WRAP_FLIP_FLAG,Ctor=isBindKey?undefined:createCtor(func);function wrapper(){var length=arguments.length,args=Array(length),index=length;while(index--){args[index]=arguments[index]}if(isCurried){var placeholder=getHolder(wrapper),holdersCount=countHolders(args,placeholder)}if(partials){args=composeArgs(args,partials,holders,isCurried)}if(partialsRight){args=composeArgsRight(args,partialsRight,holdersRight,isCurried)}length-=holdersCount;if(isCurried&&length<arity){var newHolders=replaceHolders(args,placeholder);return createRecurry(func,bitmask,createHybrid,wrapper.placeholder,thisArg,args,newHolders,argPos,ary,arity-length)}var thisBinding=isBind?thisArg:this,fn=isBindKey?thisBinding[func]:func;length=args.length;if(argPos){args=reorder(args,argPos)}else if(isFlip&&length>1){args.reverse()}if(isAry&&ary<length){args.length=ary}if(this&&this!==root&&this instanceof wrapper){fn=Ctor||createCtor(fn)}return fn.apply(thisBinding,args)}return wrapper}function createInverter(setter,toIteratee){return function(object,iteratee){return baseInverter(object,setter,toIteratee(iteratee),{})}}function createMathOperation(operator,defaultValue){return function(value,other){var result;if(value===undefined&&other===undefined){return defaultValue}if(value!==undefined){result=value}if(other!==undefined){if(result===undefined){return other}if(typeof value=="string"||typeof other=="string"){value=baseToString(value);other=baseToString(other)}else{value=baseToNumber(value);other=baseToNumber(other)}result=operator(value,other)}return result}}function createOver(arrayFunc){return flatRest(function(iteratees){iteratees=arrayMap(iteratees,baseUnary(getIteratee()));return baseRest(function(args){var thisArg=this;return arrayFunc(iteratees,function(iteratee){return apply(iteratee,thisArg,args)})})})}function createPadding(length,chars){chars=chars===undefined?" ":baseToString(chars);var charsLength=chars.length;if(charsLength<2){return charsLength?baseRepeat(chars,length):chars}var result=baseRepeat(chars,nativeCeil(length/stringSize(chars)));return hasUnicode(chars)?castSlice(stringToArray(result),0,length).join(""):result.slice(0,length)}function createPartial(func,bitmask,thisArg,partials){var isBind=bitmask&WRAP_BIND_FLAG,Ctor=createCtor(func);function wrapper(){var argsIndex=-1,argsLength=arguments.length,leftIndex=-1,leftLength=partials.length,args=Array(leftLength+argsLength),fn=this&&this!==root&&this instanceof wrapper?Ctor:func;while(++leftIndex<leftLength){args[leftIndex]=partials[leftIndex]}while(argsLength--){args[leftIndex++]=arguments[++argsIndex]}return apply(fn,isBind?thisArg:this,args)}return wrapper}function createRange(fromRight){return function(start,end,step){if(step&&typeof step!="number"&&isIterateeCall(start,end,step)){end=step=undefined}start=toFinite(start);if(end===undefined){end=start;start=0}else{end=toFinite(end)}step=step===undefined?start<end?1:-1:toFinite(step);return baseRange(start,end,step,fromRight)}}function createRelationalOperation(operator){return function(value,other){if(!(typeof value=="string"&&typeof other=="string")){value=toNumber(value);
other=toNumber(other)}return operator(value,other)}}function createRecurry(func,bitmask,wrapFunc,placeholder,thisArg,partials,holders,argPos,ary,arity){var isCurry=bitmask&WRAP_CURRY_FLAG,newHolders=isCurry?holders:undefined,newHoldersRight=isCurry?undefined:holders,newPartials=isCurry?partials:undefined,newPartialsRight=isCurry?undefined:partials;bitmask|=isCurry?WRAP_PARTIAL_FLAG:WRAP_PARTIAL_RIGHT_FLAG;bitmask&=~(isCurry?WRAP_PARTIAL_RIGHT_FLAG:WRAP_PARTIAL_FLAG);if(!(bitmask&WRAP_CURRY_BOUND_FLAG)){bitmask&=~(WRAP_BIND_FLAG|WRAP_BIND_KEY_FLAG)}var newData=[func,bitmask,thisArg,newPartials,newHolders,newPartialsRight,newHoldersRight,argPos,ary,arity];var result=wrapFunc.apply(undefined,newData);if(isLaziable(func)){setData(result,newData)}result.placeholder=placeholder;return setWrapToString(result,func,bitmask)}function createRound(methodName){var func=Math[methodName];return function(number,precision){number=toNumber(number);precision=precision==null?0:nativeMin(toInteger(precision),292);if(precision){var pair=(toString(number)+"e").split("e"),value=func(pair[0]+"e"+(+pair[1]+precision));pair=(toString(value)+"e").split("e");return+(pair[0]+"e"+(+pair[1]-precision))}return func(number)}}var createSet=!(Set&&1/setToArray(new Set([,-0]))[1]==INFINITY)?noop:function(values){return new Set(values)};function createToPairs(keysFunc){return function(object){var tag=getTag(object);if(tag==mapTag){return mapToArray(object)}if(tag==setTag){return setToPairs(object)}return baseToPairs(object,keysFunc(object))}}function createWrap(func,bitmask,thisArg,partials,holders,argPos,ary,arity){var isBindKey=bitmask&WRAP_BIND_KEY_FLAG;if(!isBindKey&&typeof func!="function"){throw new TypeError(FUNC_ERROR_TEXT)}var length=partials?partials.length:0;if(!length){bitmask&=~(WRAP_PARTIAL_FLAG|WRAP_PARTIAL_RIGHT_FLAG);partials=holders=undefined}ary=ary===undefined?ary:nativeMax(toInteger(ary),0);arity=arity===undefined?arity:toInteger(arity);length-=holders?holders.length:0;if(bitmask&WRAP_PARTIAL_RIGHT_FLAG){var partialsRight=partials,holdersRight=holders;partials=holders=undefined}var data=isBindKey?undefined:getData(func);var newData=[func,bitmask,thisArg,partials,holders,partialsRight,holdersRight,argPos,ary,arity];if(data){mergeData(newData,data)}func=newData[0];bitmask=newData[1];thisArg=newData[2];partials=newData[3];holders=newData[4];arity=newData[9]=newData[9]===undefined?isBindKey?0:func.length:nativeMax(newData[9]-length,0);if(!arity&&bitmask&(WRAP_CURRY_FLAG|WRAP_CURRY_RIGHT_FLAG)){bitmask&=~(WRAP_CURRY_FLAG|WRAP_CURRY_RIGHT_FLAG)}if(!bitmask||bitmask==WRAP_BIND_FLAG){var result=createBind(func,bitmask,thisArg)}else if(bitmask==WRAP_CURRY_FLAG||bitmask==WRAP_CURRY_RIGHT_FLAG){result=createCurry(func,bitmask,arity)}else if((bitmask==WRAP_PARTIAL_FLAG||bitmask==(WRAP_BIND_FLAG|WRAP_PARTIAL_FLAG))&&!holders.length){result=createPartial(func,bitmask,thisArg,partials)}else{result=createHybrid.apply(undefined,newData)}var setter=data?baseSetData:setData;return setWrapToString(setter(result,newData),func,bitmask)}function customDefaultsAssignIn(objValue,srcValue,key,object){if(objValue===undefined||eq(objValue,objectProto[key])&&!hasOwnProperty.call(object,key)){return srcValue}return objValue}function customDefaultsMerge(objValue,srcValue,key,object,source,stack){if(isObject(objValue)&&isObject(srcValue)){stack.set(srcValue,objValue);baseMerge(objValue,srcValue,undefined,customDefaultsMerge,stack);stack["delete"](srcValue)}return objValue}function customOmitClone(value){return isPlainObject(value)?undefined:value}function equalArrays(array,other,bitmask,customizer,equalFunc,stack){var isPartial=bitmask&COMPARE_PARTIAL_FLAG,arrLength=array.length,othLength=other.length;if(arrLength!=othLength&&!(isPartial&&othLength>arrLength)){return false}var stacked=stack.get(array);if(stacked&&stack.get(other)){return stacked==other}var index=-1,result=true,seen=bitmask&COMPARE_UNORDERED_FLAG?new SetCache:undefined;stack.set(array,other);stack.set(other,array);while(++index<arrLength){var arrValue=array[index],othValue=other[index];if(customizer){var compared=isPartial?customizer(othValue,arrValue,index,other,array,stack):customizer(arrValue,othValue,index,array,other,stack)}if(compared!==undefined){if(compared){continue}result=false;break}if(seen){if(!arraySome(other,function(othValue,othIndex){if(!cacheHas(seen,othIndex)&&(arrValue===othValue||equalFunc(arrValue,othValue,bitmask,customizer,stack))){return seen.push(othIndex)}})){result=false;break}}else if(!(arrValue===othValue||equalFunc(arrValue,othValue,bitmask,customizer,stack))){result=false;break}}stack["delete"](array);stack["delete"](other);return result}function equalByTag(object,other,tag,bitmask,customizer,equalFunc,stack){switch(tag){case dataViewTag:if(object.byteLength!=other.byteLength||object.byteOffset!=other.byteOffset){return false}object=object.buffer;other=other.buffer;case arrayBufferTag:if(object.byteLength!=other.byteLength||!equalFunc(new Uint8Array(object),new Uint8Array(other))){return false}return true;case boolTag:case dateTag:case numberTag:return eq(+object,+other);case errorTag:return object.name==other.name&&object.message==other.message;case regexpTag:case stringTag:return object==other+"";case mapTag:var convert=mapToArray;case setTag:var isPartial=bitmask&COMPARE_PARTIAL_FLAG;convert||(convert=setToArray);if(object.size!=other.size&&!isPartial){return false}var stacked=stack.get(object);if(stacked){return stacked==other}bitmask|=COMPARE_UNORDERED_FLAG;stack.set(object,other);var result=equalArrays(convert(object),convert(other),bitmask,customizer,equalFunc,stack);stack["delete"](object);return result;case symbolTag:if(symbolValueOf){return symbolValueOf.call(object)==symbolValueOf.call(other)}}return false}function equalObjects(object,other,bitmask,customizer,equalFunc,stack){var isPartial=bitmask&COMPARE_PARTIAL_FLAG,objProps=getAllKeys(object),objLength=objProps.length,othProps=getAllKeys(other),othLength=othProps.length;if(objLength!=othLength&&!isPartial){return false}var index=objLength;while(index--){var key=objProps[index];if(!(isPartial?key in other:hasOwnProperty.call(other,key))){return false}}var stacked=stack.get(object);if(stacked&&stack.get(other)){return stacked==other}var result=true;stack.set(object,other);stack.set(other,object);var skipCtor=isPartial;while(++index<objLength){key=objProps[index];var objValue=object[key],othValue=other[key];if(customizer){var compared=isPartial?customizer(othValue,objValue,key,other,object,stack):customizer(objValue,othValue,key,object,other,stack)}if(!(compared===undefined?objValue===othValue||equalFunc(objValue,othValue,bitmask,customizer,stack):compared)){result=false;break}skipCtor||(skipCtor=key=="constructor")}if(result&&!skipCtor){var objCtor=object.constructor,othCtor=other.constructor;if(objCtor!=othCtor&&("constructor"in object&&"constructor"in other)&&!(typeof objCtor=="function"&&objCtor instanceof objCtor&&typeof othCtor=="function"&&othCtor instanceof othCtor)){result=false}}stack["delete"](object);stack["delete"](other);return result}function flatRest(func){return setToString(overRest(func,undefined,flatten),func+"")}function getAllKeys(object){return baseGetAllKeys(object,keys,getSymbols)}function getAllKeysIn(object){return baseGetAllKeys(object,keysIn,getSymbolsIn)}var getData=!metaMap?noop:function(func){return metaMap.get(func)};function getFuncName(func){var result=func.name+"",array=realNames[result],length=hasOwnProperty.call(realNames,result)?array.length:0;while(length--){var data=array[length],otherFunc=data.func;if(otherFunc==null||otherFunc==func){return data.name}}return result}function getHolder(func){var object=hasOwnProperty.call(lodash,"placeholder")?lodash:func;return object.placeholder}function getIteratee(){var result=lodash.iteratee||iteratee;result=result===iteratee?baseIteratee:result;return arguments.length?result(arguments[0],arguments[1]):result}function getMapData(map,key){var data=map.__data__;return isKeyable(key)?data[typeof key=="string"?"string":"hash"]:data.map}function getMatchData(object){var result=keys(object),length=result.length;while(length--){var key=result[length],value=object[key];result[length]=[key,value,isStrictComparable(value)]}return result}function getNative(object,key){var value=getValue(object,key);return baseIsNative(value)?value:undefined}function getRawTag(value){var isOwn=hasOwnProperty.call(value,symToStringTag),tag=value[symToStringTag];try{value[symToStringTag]=undefined;var unmasked=true}catch(e){}var result=nativeObjectToString.call(value);if(unmasked){if(isOwn){value[symToStringTag]=tag}else{delete value[symToStringTag]}}return result}var getSymbols=!nativeGetSymbols?stubArray:function(object){if(object==null){return[]}object=Object(object);return arrayFilter(nativeGetSymbols(object),function(symbol){return propertyIsEnumerable.call(object,symbol)})};var getSymbolsIn=!nativeGetSymbols?stubArray:function(object){var result=[];while(object){arrayPush(result,getSymbols(object));object=getPrototype(object)}return result};var getTag=baseGetTag;if(DataView&&getTag(new DataView(new ArrayBuffer(1)))!=dataViewTag||Map&&getTag(new Map)!=mapTag||Promise&&getTag(Promise.resolve())!=promiseTag||Set&&getTag(new Set)!=setTag||WeakMap&&getTag(new WeakMap)!=weakMapTag){getTag=function(value){var result=baseGetTag(value),Ctor=result==objectTag?value.constructor:undefined,ctorString=Ctor?toSource(Ctor):"";if(ctorString){switch(ctorString){case dataViewCtorString:return dataViewTag;case mapCtorString:return mapTag;case promiseCtorString:return promiseTag;case setCtorString:return setTag;case weakMapCtorString:return weakMapTag}}return result}}function getView(start,end,transforms){var index=-1,length=transforms.length;while(++index<length){var data=transforms[index],size=data.size;switch(data.type){case"drop":start+=size;break;case"dropRight":end-=size;break;case"take":end=nativeMin(end,start+size);break;case"takeRight":start=nativeMax(start,end-size);break}}return{start:start,end:end}}function getWrapDetails(source){var match=source.match(reWrapDetails);return match?match[1].split(reSplitDetails):[]}function hasPath(object,path,hasFunc){path=castPath(path,object);var index=-1,length=path.length,result=false;while(++index<length){var key=toKey(path[index]);if(!(result=object!=null&&hasFunc(object,key))){break}object=object[key]}if(result||++index!=length){return result}length=object==null?0:object.length;return!!length&&isLength(length)&&isIndex(key,length)&&(isArray(object)||isArguments(object))}function initCloneArray(array){var length=array.length,result=array.constructor(length);if(length&&typeof array[0]=="string"&&hasOwnProperty.call(array,"index")){result.index=array.index;result.input=array.input}return result}function initCloneObject(object){return typeof object.constructor=="function"&&!isPrototype(object)?baseCreate(getPrototype(object)):{}}function initCloneByTag(object,tag,cloneFunc,isDeep){var Ctor=object.constructor;switch(tag){case arrayBufferTag:return cloneArrayBuffer(object);case boolTag:case dateTag:return new Ctor(+object);case dataViewTag:return cloneDataView(object,isDeep);case float32Tag:case float64Tag:case int8Tag:case int16Tag:case int32Tag:case uint8Tag:case uint8ClampedTag:case uint16Tag:case uint32Tag:return cloneTypedArray(object,isDeep);case mapTag:return cloneMap(object,isDeep,cloneFunc);case numberTag:case stringTag:return new Ctor(object);case regexpTag:return cloneRegExp(object);case setTag:return cloneSet(object,isDeep,cloneFunc);case symbolTag:return cloneSymbol(object)}}function insertWrapDetails(source,details){var length=details.length;if(!length){return source}var lastIndex=length-1;details[lastIndex]=(length>1?"& ":"")+details[lastIndex];details=details.join(length>2?", ":" ");return source.replace(reWrapComment,"{\n/* [wrapped with "+details+"] */\n")}function isFlattenable(value){return isArray(value)||isArguments(value)||!!(spreadableSymbol&&value&&value[spreadableSymbol])}function isIndex(value,length){length=length==null?MAX_SAFE_INTEGER:length;return!!length&&(typeof value=="number"||reIsUint.test(value))&&(value>-1&&value%1==0&&value<length)}function isIterateeCall(value,index,object){if(!isObject(object)){return false}var type=typeof index;if(type=="number"?isArrayLike(object)&&isIndex(index,object.length):type=="string"&&index in object){return eq(object[index],value)}return false}function isKey(value,object){if(isArray(value)){return false}var type=typeof value;if(type=="number"||type=="symbol"||type=="boolean"||value==null||isSymbol(value)){return true}return reIsPlainProp.test(value)||!reIsDeepProp.test(value)||object!=null&&value in Object(object)}function isKeyable(value){var type=typeof value;return type=="string"||type=="number"||type=="symbol"||type=="boolean"?value!=="__proto__":value===null}function isLaziable(func){var funcName=getFuncName(func),other=lodash[funcName];if(typeof other!="function"||!(funcName in LazyWrapper.prototype)){return false}if(func===other){return true}var data=getData(other);return!!data&&func===data[0]}function isMasked(func){return!!maskSrcKey&&maskSrcKey in func}var isMaskable=coreJsData?isFunction:stubFalse;function isPrototype(value){var Ctor=value&&value.constructor,proto=typeof Ctor=="function"&&Ctor.prototype||objectProto;return value===proto}function isStrictComparable(value){return value===value&&!isObject(value)}function matchesStrictComparable(key,srcValue){return function(object){if(object==null){return false}return object[key]===srcValue&&(srcValue!==undefined||key in Object(object))}}function memoizeCapped(func){var result=memoize(func,function(key){if(cache.size===MAX_MEMOIZE_SIZE){cache.clear()}return key});var cache=result.cache;return result}function mergeData(data,source){var bitmask=data[1],srcBitmask=source[1],newBitmask=bitmask|srcBitmask,isCommon=newBitmask<(WRAP_BIND_FLAG|WRAP_BIND_KEY_FLAG|WRAP_ARY_FLAG);var isCombo=srcBitmask==WRAP_ARY_FLAG&&bitmask==WRAP_CURRY_FLAG||srcBitmask==WRAP_ARY_FLAG&&bitmask==WRAP_REARG_FLAG&&data[7].length<=source[8]||srcBitmask==(WRAP_ARY_FLAG|WRAP_REARG_FLAG)&&source[7].length<=source[8]&&bitmask==WRAP_CURRY_FLAG;if(!(isCommon||isCombo)){return data}if(srcBitmask&WRAP_BIND_FLAG){data[2]=source[2];newBitmask|=bitmask&WRAP_BIND_FLAG?0:WRAP_CURRY_BOUND_FLAG}var value=source[3];if(value){var partials=data[3];data[3]=partials?composeArgs(partials,value,source[4]):value;data[4]=partials?replaceHolders(data[3],PLACEHOLDER):source[4]}value=source[5];if(value){partials=data[5];data[5]=partials?composeArgsRight(partials,value,source[6]):value;data[6]=partials?replaceHolders(data[5],PLACEHOLDER):source[6]}value=source[7];if(value){data[7]=value}if(srcBitmask&WRAP_ARY_FLAG){data[8]=data[8]==null?source[8]:nativeMin(data[8],source[8])}if(data[9]==null){data[9]=source[9]}data[0]=source[0];data[1]=newBitmask;return data}function nativeKeysIn(object){var result=[];if(object!=null){for(var key in Object(object)){result.push(key)}}return result}function objectToString(value){return nativeObjectToString.call(value)}function overRest(func,start,transform){start=nativeMax(start===undefined?func.length-1:start,0);return function(){var args=arguments,index=-1,length=nativeMax(args.length-start,0),array=Array(length);while(++index<length){array[index]=args[start+index]}index=-1;var otherArgs=Array(start+1);while(++index<start){otherArgs[index]=args[index]}otherArgs[start]=transform(array);return apply(func,this,otherArgs)}}function parent(object,path){return path.length<2?object:baseGet(object,baseSlice(path,0,-1))}function reorder(array,indexes){var arrLength=array.length,length=nativeMin(indexes.length,arrLength),oldArray=copyArray(array);while(length--){var index=indexes[length];array[length]=isIndex(index,arrLength)?oldArray[index]:undefined}return array}var setData=shortOut(baseSetData);var setTimeout=ctxSetTimeout||function(func,wait){return root.setTimeout(func,wait)};var setToString=shortOut(baseSetToString);function setWrapToString(wrapper,reference,bitmask){var source=reference+"";return setToString(wrapper,insertWrapDetails(source,updateWrapDetails(getWrapDetails(source),bitmask)))}function shortOut(func){var count=0,lastCalled=0;return function(){var stamp=nativeNow(),remaining=HOT_SPAN-(stamp-lastCalled);lastCalled=stamp;if(remaining>0){if(++count>=HOT_COUNT){return arguments[0]}}else{count=0}return func.apply(undefined,arguments)}}function shuffleSelf(array,size){var index=-1,length=array.length,lastIndex=length-1;size=size===undefined?length:size;while(++index<size){var rand=baseRandom(index,lastIndex),value=array[rand];array[rand]=array[index];array[index]=value}array.length=size;return array}var stringToPath=memoizeCapped(function(string){var result=[];if(reLeadingDot.test(string)){result.push("")}string.replace(rePropName,function(match,number,quote,string){result.push(quote?string.replace(reEscapeChar,"$1"):number||match)});return result});function toKey(value){if(typeof value=="string"||isSymbol(value)){return value}var result=value+"";return result=="0"&&1/value==-INFINITY?"-0":result}function toSource(func){if(func!=null){try{return funcToString.call(func)}catch(e){}try{return func+""}catch(e){}}return""}function updateWrapDetails(details,bitmask){arrayEach(wrapFlags,function(pair){var value="_."+pair[0];if(bitmask&pair[1]&&!arrayIncludes(details,value)){details.push(value)}});return details.sort()}function wrapperClone(wrapper){if(wrapper instanceof LazyWrapper){return wrapper.clone()}var result=new LodashWrapper(wrapper.__wrapped__,wrapper.__chain__);result.__actions__=copyArray(wrapper.__actions__);result.__index__=wrapper.__index__;result.__values__=wrapper.__values__;return result}function chunk(array,size,guard){if(guard?isIterateeCall(array,size,guard):size===undefined){size=1}else{size=nativeMax(toInteger(size),0)}var length=array==null?0:array.length;if(!length||size<1){return[]}var index=0,resIndex=0,result=Array(nativeCeil(length/size));while(index<length){result[resIndex++]=baseSlice(array,index,index+=size)}return result}function compact(array){var index=-1,length=array==null?0:array.length,resIndex=0,result=[];while(++index<length){var value=array[index];if(value){result[resIndex++]=value}}return result}function concat(){var length=arguments.length;if(!length){return[]}var args=Array(length-1),array=arguments[0],index=length;while(index--){args[index-1]=arguments[index]}return arrayPush(isArray(array)?copyArray(array):[array],baseFlatten(args,1))}var difference=baseRest(function(array,values){return isArrayLikeObject(array)?baseDifference(array,baseFlatten(values,1,isArrayLikeObject,true)):[]});var differenceBy=baseRest(function(array,values){var iteratee=last(values);if(isArrayLikeObject(iteratee)){iteratee=undefined}return isArrayLikeObject(array)?baseDifference(array,baseFlatten(values,1,isArrayLikeObject,true),getIteratee(iteratee,2)):[]});var differenceWith=baseRest(function(array,values){var comparator=last(values);if(isArrayLikeObject(comparator)){comparator=undefined}return isArrayLikeObject(array)?baseDifference(array,baseFlatten(values,1,isArrayLikeObject,true),undefined,comparator):[]});function drop(array,n,guard){var length=array==null?0:array.length;if(!length){return[]}n=guard||n===undefined?1:toInteger(n);return baseSlice(array,n<0?0:n,length)}function dropRight(array,n,guard){var length=array==null?0:array.length;if(!length){return[]}n=guard||n===undefined?1:toInteger(n);n=length-n;return baseSlice(array,0,n<0?0:n)}function dropRightWhile(array,predicate){return array&&array.length?baseWhile(array,getIteratee(predicate,3),true,true):[]}function dropWhile(array,predicate){return array&&array.length?baseWhile(array,getIteratee(predicate,3),true):[]}function fill(array,value,start,end){var length=array==null?0:array.length;if(!length){return[]}if(start&&typeof start!="number"&&isIterateeCall(array,value,start)){start=0;end=length}return baseFill(array,value,start,end)}function findIndex(array,predicate,fromIndex){var length=array==null?0:array.length;if(!length){return-1}var index=fromIndex==null?0:toInteger(fromIndex);if(index<0){index=nativeMax(length+index,0)}return baseFindIndex(array,getIteratee(predicate,3),index)}function findLastIndex(array,predicate,fromIndex){var length=array==null?0:array.length;if(!length){return-1}var index=length-1;if(fromIndex!==undefined){index=toInteger(fromIndex);index=fromIndex<0?nativeMax(length+index,0):nativeMin(index,length-1)}return baseFindIndex(array,getIteratee(predicate,3),index,true)}function flatten(array){var length=array==null?0:array.length;return length?baseFlatten(array,1):[]}function flattenDeep(array){var length=array==null?0:array.length;return length?baseFlatten(array,INFINITY):[]}function flattenDepth(array,depth){var length=array==null?0:array.length;if(!length){return[]}depth=depth===undefined?1:toInteger(depth);return baseFlatten(array,depth)}function fromPairs(pairs){var index=-1,length=pairs==null?0:pairs.length,result={};while(++index<length){var pair=pairs[index];result[pair[0]]=pair[1]}return result}function head(array){return array&&array.length?array[0]:undefined}function indexOf(array,value,fromIndex){var length=array==null?0:array.length;if(!length){return-1}var index=fromIndex==null?0:toInteger(fromIndex);if(index<0){index=nativeMax(length+index,0)}return baseIndexOf(array,value,index)}function initial(array){var length=array==null?0:array.length;return length?baseSlice(array,0,-1):[]}var intersection=baseRest(function(arrays){var mapped=arrayMap(arrays,castArrayLikeObject);return mapped.length&&mapped[0]===arrays[0]?baseIntersection(mapped):[]});var intersectionBy=baseRest(function(arrays){var iteratee=last(arrays),mapped=arrayMap(arrays,castArrayLikeObject);if(iteratee===last(mapped)){iteratee=undefined}else{mapped.pop()}return mapped.length&&mapped[0]===arrays[0]?baseIntersection(mapped,getIteratee(iteratee,2)):[]});var intersectionWith=baseRest(function(arrays){var comparator=last(arrays),mapped=arrayMap(arrays,castArrayLikeObject);comparator=typeof comparator=="function"?comparator:undefined;if(comparator){mapped.pop()}return mapped.length&&mapped[0]===arrays[0]?baseIntersection(mapped,undefined,comparator):[]});function join(array,separator){return array==null?"":nativeJoin.call(array,separator)}function last(array){var length=array==null?0:array.length;return length?array[length-1]:undefined}function lastIndexOf(array,value,fromIndex){var length=array==null?0:array.length;if(!length){return-1}var index=length;if(fromIndex!==undefined){index=toInteger(fromIndex);index=index<0?nativeMax(length+index,0):nativeMin(index,length-1)}return value===value?strictLastIndexOf(array,value,index):baseFindIndex(array,baseIsNaN,index,true)}function nth(array,n){return array&&array.length?baseNth(array,toInteger(n)):undefined}var pull=baseRest(pullAll);function pullAll(array,values){return array&&array.length&&values&&values.length?basePullAll(array,values):array}function pullAllBy(array,values,iteratee){return array&&array.length&&values&&values.length?basePullAll(array,values,getIteratee(iteratee,2)):array}function pullAllWith(array,values,comparator){return array&&array.length&&values&&values.length?basePullAll(array,values,undefined,comparator):array}var pullAt=flatRest(function(array,indexes){var length=array==null?0:array.length,result=baseAt(array,indexes);basePullAt(array,arrayMap(indexes,function(index){return isIndex(index,length)?+index:index}).sort(compareAscending));return result});function remove(array,predicate){var result=[];if(!(array&&array.length)){return result}var index=-1,indexes=[],length=array.length;predicate=getIteratee(predicate,3);while(++index<length){var value=array[index];if(predicate(value,index,array)){result.push(value);indexes.push(index)}}basePullAt(array,indexes);return result}function reverse(array){return array==null?array:nativeReverse.call(array)}function slice(array,start,end){var length=array==null?0:array.length;if(!length){return[]}if(end&&typeof end!="number"&&isIterateeCall(array,start,end)){start=0;end=length}else{start=start==null?0:toInteger(start);end=end===undefined?length:toInteger(end)}return baseSlice(array,start,end)}function sortedIndex(array,value){return baseSortedIndex(array,value)}function sortedIndexBy(array,value,iteratee){return baseSortedIndexBy(array,value,getIteratee(iteratee,2))}function sortedIndexOf(array,value){var length=array==null?0:array.length;if(length){var index=baseSortedIndex(array,value);if(index<length&&eq(array[index],value)){return index}}return-1}function sortedLastIndex(array,value){return baseSortedIndex(array,value,true)}function sortedLastIndexBy(array,value,iteratee){return baseSortedIndexBy(array,value,getIteratee(iteratee,2),true)}function sortedLastIndexOf(array,value){var length=array==null?0:array.length;if(length){var index=baseSortedIndex(array,value,true)-1;if(eq(array[index],value)){return index}}return-1}function sortedUniq(array){return array&&array.length?baseSortedUniq(array):[]}function sortedUniqBy(array,iteratee){return array&&array.length?baseSortedUniq(array,getIteratee(iteratee,2)):[]}function tail(array){var length=array==null?0:array.length;return length?baseSlice(array,1,length):[]}function take(array,n,guard){if(!(array&&array.length)){return[]}n=guard||n===undefined?1:toInteger(n);return baseSlice(array,0,n<0?0:n)}function takeRight(array,n,guard){var length=array==null?0:array.length;if(!length){return[]}n=guard||n===undefined?1:toInteger(n);n=length-n;return baseSlice(array,n<0?0:n,length)}function takeRightWhile(array,predicate){return array&&array.length?baseWhile(array,getIteratee(predicate,3),false,true):[]}function takeWhile(array,predicate){return array&&array.length?baseWhile(array,getIteratee(predicate,3)):[]}var union=baseRest(function(arrays){return baseUniq(baseFlatten(arrays,1,isArrayLikeObject,true))});var unionBy=baseRest(function(arrays){var iteratee=last(arrays);if(isArrayLikeObject(iteratee)){iteratee=undefined}return baseUniq(baseFlatten(arrays,1,isArrayLikeObject,true),getIteratee(iteratee,2))});var unionWith=baseRest(function(arrays){var comparator=last(arrays);comparator=typeof comparator=="function"?comparator:undefined;return baseUniq(baseFlatten(arrays,1,isArrayLikeObject,true),undefined,comparator)});function uniq(array){return array&&array.length?baseUniq(array):[]}function uniqBy(array,iteratee){return array&&array.length?baseUniq(array,getIteratee(iteratee,2)):[]}function uniqWith(array,comparator){comparator=typeof comparator=="function"?comparator:undefined;return array&&array.length?baseUniq(array,undefined,comparator):[]}function unzip(array){if(!(array&&array.length)){return[]}var length=0;array=arrayFilter(array,function(group){if(isArrayLikeObject(group)){length=nativeMax(group.length,length);return true}});return baseTimes(length,function(index){return arrayMap(array,baseProperty(index))})}function unzipWith(array,iteratee){if(!(array&&array.length)){return[]}var result=unzip(array);if(iteratee==null){return result}return arrayMap(result,function(group){return apply(iteratee,undefined,group)})}var without=baseRest(function(array,values){return isArrayLikeObject(array)?baseDifference(array,values):[]});var xor=baseRest(function(arrays){return baseXor(arrayFilter(arrays,isArrayLikeObject))});var xorBy=baseRest(function(arrays){var iteratee=last(arrays);if(isArrayLikeObject(iteratee)){iteratee=undefined}return baseXor(arrayFilter(arrays,isArrayLikeObject),getIteratee(iteratee,2))});var xorWith=baseRest(function(arrays){var comparator=last(arrays);comparator=typeof comparator=="function"?comparator:undefined;return baseXor(arrayFilter(arrays,isArrayLikeObject),undefined,comparator)});var zip=baseRest(unzip);function zipObject(props,values){return baseZipObject(props||[],values||[],assignValue)}function zipObjectDeep(props,values){return baseZipObject(props||[],values||[],baseSet)}var zipWith=baseRest(function(arrays){var length=arrays.length,iteratee=length>1?arrays[length-1]:undefined;iteratee=typeof iteratee=="function"?(arrays.pop(),iteratee):undefined;return unzipWith(arrays,iteratee)});function chain(value){var result=lodash(value);result.__chain__=true;return result}function tap(value,interceptor){interceptor(value);return value}function thru(value,interceptor){return interceptor(value)}var wrapperAt=flatRest(function(paths){var length=paths.length,start=length?paths[0]:0,value=this.__wrapped__,interceptor=function(object){return baseAt(object,paths)};if(length>1||this.__actions__.length||!(value instanceof LazyWrapper)||!isIndex(start)){return this.thru(interceptor)}value=value.slice(start,+start+(length?1:0));value.__actions__.push({func:thru,args:[interceptor],thisArg:undefined});return new LodashWrapper(value,this.__chain__).thru(function(array){if(length&&!array.length){array.push(undefined)}return array})});function wrapperChain(){return chain(this)}function wrapperCommit(){return new LodashWrapper(this.value(),this.__chain__)}function wrapperNext(){if(this.__values__===undefined){this.__values__=toArray(this.value())}var done=this.__index__>=this.__values__.length,value=done?undefined:this.__values__[this.__index__++];return{done:done,value:value}}function wrapperToIterator(){return this}function wrapperPlant(value){var result,parent=this;while(parent instanceof baseLodash){var clone=wrapperClone(parent);clone.__index__=0;clone.__values__=undefined;if(result){previous.__wrapped__=clone}else{result=clone}var previous=clone;parent=parent.__wrapped__}previous.__wrapped__=value;return result}function wrapperReverse(){var value=this.__wrapped__;if(value instanceof LazyWrapper){var wrapped=value;if(this.__actions__.length){wrapped=new LazyWrapper(this)}wrapped=wrapped.reverse();wrapped.__actions__.push({func:thru,args:[reverse],thisArg:undefined});return new LodashWrapper(wrapped,this.__chain__)}return this.thru(reverse)}function wrapperValue(){return baseWrapperValue(this.__wrapped__,this.__actions__)}var countBy=createAggregator(function(result,value,key){if(hasOwnProperty.call(result,key)){++result[key]}else{baseAssignValue(result,key,1)}});function every(collection,predicate,guard){var func=isArray(collection)?arrayEvery:baseEvery;if(guard&&isIterateeCall(collection,predicate,guard)){predicate=undefined}return func(collection,getIteratee(predicate,3))}function filter(collection,predicate){var func=isArray(collection)?arrayFilter:baseFilter;return func(collection,getIteratee(predicate,3))}var find=createFind(findIndex);var findLast=createFind(findLastIndex);function flatMap(collection,iteratee){return baseFlatten(map(collection,iteratee),1)}function flatMapDeep(collection,iteratee){return baseFlatten(map(collection,iteratee),INFINITY)}function flatMapDepth(collection,iteratee,depth){depth=depth===undefined?1:toInteger(depth);return baseFlatten(map(collection,iteratee),depth)}function forEach(collection,iteratee){var func=isArray(collection)?arrayEach:baseEach;return func(collection,getIteratee(iteratee,3))}function forEachRight(collection,iteratee){var func=isArray(collection)?arrayEachRight:baseEachRight;return func(collection,getIteratee(iteratee,3))}var groupBy=createAggregator(function(result,value,key){if(hasOwnProperty.call(result,key)){result[key].push(value)}else{baseAssignValue(result,key,[value])}});function includes(collection,value,fromIndex,guard){collection=isArrayLike(collection)?collection:values(collection);fromIndex=fromIndex&&!guard?toInteger(fromIndex):0;var length=collection.length;if(fromIndex<0){fromIndex=nativeMax(length+fromIndex,0)}return isString(collection)?fromIndex<=length&&collection.indexOf(value,fromIndex)>-1:!!length&&baseIndexOf(collection,value,fromIndex)>-1}var invokeMap=baseRest(function(collection,path,args){var index=-1,isFunc=typeof path=="function",result=isArrayLike(collection)?Array(collection.length):[];baseEach(collection,function(value){result[++index]=isFunc?apply(path,value,args):baseInvoke(value,path,args);
});return result});var keyBy=createAggregator(function(result,value,key){baseAssignValue(result,key,value)});function map(collection,iteratee){var func=isArray(collection)?arrayMap:baseMap;return func(collection,getIteratee(iteratee,3))}function orderBy(collection,iteratees,orders,guard){if(collection==null){return[]}if(!isArray(iteratees)){iteratees=iteratees==null?[]:[iteratees]}orders=guard?undefined:orders;if(!isArray(orders)){orders=orders==null?[]:[orders]}return baseOrderBy(collection,iteratees,orders)}var partition=createAggregator(function(result,value,key){result[key?0:1].push(value)},function(){return[[],[]]});function reduce(collection,iteratee,accumulator){var func=isArray(collection)?arrayReduce:baseReduce,initAccum=arguments.length<3;return func(collection,getIteratee(iteratee,4),accumulator,initAccum,baseEach)}function reduceRight(collection,iteratee,accumulator){var func=isArray(collection)?arrayReduceRight:baseReduce,initAccum=arguments.length<3;return func(collection,getIteratee(iteratee,4),accumulator,initAccum,baseEachRight)}function reject(collection,predicate){var func=isArray(collection)?arrayFilter:baseFilter;return func(collection,negate(getIteratee(predicate,3)))}function sample(collection){var func=isArray(collection)?arraySample:baseSample;return func(collection)}function sampleSize(collection,n,guard){if(guard?isIterateeCall(collection,n,guard):n===undefined){n=1}else{n=toInteger(n)}var func=isArray(collection)?arraySampleSize:baseSampleSize;return func(collection,n)}function shuffle(collection){var func=isArray(collection)?arrayShuffle:baseShuffle;return func(collection)}function size(collection){if(collection==null){return 0}if(isArrayLike(collection)){return isString(collection)?stringSize(collection):collection.length}var tag=getTag(collection);if(tag==mapTag||tag==setTag){return collection.size}return baseKeys(collection).length}function some(collection,predicate,guard){var func=isArray(collection)?arraySome:baseSome;if(guard&&isIterateeCall(collection,predicate,guard)){predicate=undefined}return func(collection,getIteratee(predicate,3))}var sortBy=baseRest(function(collection,iteratees){if(collection==null){return[]}var length=iteratees.length;if(length>1&&isIterateeCall(collection,iteratees[0],iteratees[1])){iteratees=[]}else if(length>2&&isIterateeCall(iteratees[0],iteratees[1],iteratees[2])){iteratees=[iteratees[0]]}return baseOrderBy(collection,baseFlatten(iteratees,1),[])});var now=ctxNow||function(){return root.Date.now()};function after(n,func){if(typeof func!="function"){throw new TypeError(FUNC_ERROR_TEXT)}n=toInteger(n);return function(){if(--n<1){return func.apply(this,arguments)}}}function ary(func,n,guard){n=guard?undefined:n;n=func&&n==null?func.length:n;return createWrap(func,WRAP_ARY_FLAG,undefined,undefined,undefined,undefined,n)}function before(n,func){var result;if(typeof func!="function"){throw new TypeError(FUNC_ERROR_TEXT)}n=toInteger(n);return function(){if(--n>0){result=func.apply(this,arguments)}if(n<=1){func=undefined}return result}}var bind=baseRest(function(func,thisArg,partials){var bitmask=WRAP_BIND_FLAG;if(partials.length){var holders=replaceHolders(partials,getHolder(bind));bitmask|=WRAP_PARTIAL_FLAG}return createWrap(func,bitmask,thisArg,partials,holders)});var bindKey=baseRest(function(object,key,partials){var bitmask=WRAP_BIND_FLAG|WRAP_BIND_KEY_FLAG;if(partials.length){var holders=replaceHolders(partials,getHolder(bindKey));bitmask|=WRAP_PARTIAL_FLAG}return createWrap(key,bitmask,object,partials,holders)});function curry(func,arity,guard){arity=guard?undefined:arity;var result=createWrap(func,WRAP_CURRY_FLAG,undefined,undefined,undefined,undefined,undefined,arity);result.placeholder=curry.placeholder;return result}function curryRight(func,arity,guard){arity=guard?undefined:arity;var result=createWrap(func,WRAP_CURRY_RIGHT_FLAG,undefined,undefined,undefined,undefined,undefined,arity);result.placeholder=curryRight.placeholder;return result}function debounce(func,wait,options){var lastArgs,lastThis,maxWait,result,timerId,lastCallTime,lastInvokeTime=0,leading=false,maxing=false,trailing=true;if(typeof func!="function"){throw new TypeError(FUNC_ERROR_TEXT)}wait=toNumber(wait)||0;if(isObject(options)){leading=!!options.leading;maxing="maxWait"in options;maxWait=maxing?nativeMax(toNumber(options.maxWait)||0,wait):maxWait;trailing="trailing"in options?!!options.trailing:trailing}function invokeFunc(time){var args=lastArgs,thisArg=lastThis;lastArgs=lastThis=undefined;lastInvokeTime=time;result=func.apply(thisArg,args);return result}function leadingEdge(time){lastInvokeTime=time;timerId=setTimeout(timerExpired,wait);return leading?invokeFunc(time):result}function remainingWait(time){var timeSinceLastCall=time-lastCallTime,timeSinceLastInvoke=time-lastInvokeTime,result=wait-timeSinceLastCall;return maxing?nativeMin(result,maxWait-timeSinceLastInvoke):result}function shouldInvoke(time){var timeSinceLastCall=time-lastCallTime,timeSinceLastInvoke=time-lastInvokeTime;return lastCallTime===undefined||timeSinceLastCall>=wait||timeSinceLastCall<0||maxing&&timeSinceLastInvoke>=maxWait}function timerExpired(){var time=now();if(shouldInvoke(time)){return trailingEdge(time)}timerId=setTimeout(timerExpired,remainingWait(time))}function trailingEdge(time){timerId=undefined;if(trailing&&lastArgs){return invokeFunc(time)}lastArgs=lastThis=undefined;return result}function cancel(){if(timerId!==undefined){clearTimeout(timerId)}lastInvokeTime=0;lastArgs=lastCallTime=lastThis=timerId=undefined}function flush(){return timerId===undefined?result:trailingEdge(now())}function debounced(){var time=now(),isInvoking=shouldInvoke(time);lastArgs=arguments;lastThis=this;lastCallTime=time;if(isInvoking){if(timerId===undefined){return leadingEdge(lastCallTime)}if(maxing){timerId=setTimeout(timerExpired,wait);return invokeFunc(lastCallTime)}}if(timerId===undefined){timerId=setTimeout(timerExpired,wait)}return result}debounced.cancel=cancel;debounced.flush=flush;return debounced}var defer=baseRest(function(func,args){return baseDelay(func,1,args)});var delay=baseRest(function(func,wait,args){return baseDelay(func,toNumber(wait)||0,args)});function flip(func){return createWrap(func,WRAP_FLIP_FLAG)}function memoize(func,resolver){if(typeof func!="function"||resolver!=null&&typeof resolver!="function"){throw new TypeError(FUNC_ERROR_TEXT)}var memoized=function(){var args=arguments,key=resolver?resolver.apply(this,args):args[0],cache=memoized.cache;if(cache.has(key)){return cache.get(key)}var result=func.apply(this,args);memoized.cache=cache.set(key,result)||cache;return result};memoized.cache=new(memoize.Cache||MapCache);return memoized}memoize.Cache=MapCache;function negate(predicate){if(typeof predicate!="function"){throw new TypeError(FUNC_ERROR_TEXT)}return function(){var args=arguments;switch(args.length){case 0:return!predicate.call(this);case 1:return!predicate.call(this,args[0]);case 2:return!predicate.call(this,args[0],args[1]);case 3:return!predicate.call(this,args[0],args[1],args[2])}return!predicate.apply(this,args)}}function once(func){return before(2,func)}var overArgs=castRest(function(func,transforms){transforms=transforms.length==1&&isArray(transforms[0])?arrayMap(transforms[0],baseUnary(getIteratee())):arrayMap(baseFlatten(transforms,1),baseUnary(getIteratee()));var funcsLength=transforms.length;return baseRest(function(args){var index=-1,length=nativeMin(args.length,funcsLength);while(++index<length){args[index]=transforms[index].call(this,args[index])}return apply(func,this,args)})});var partial=baseRest(function(func,partials){var holders=replaceHolders(partials,getHolder(partial));return createWrap(func,WRAP_PARTIAL_FLAG,undefined,partials,holders)});var partialRight=baseRest(function(func,partials){var holders=replaceHolders(partials,getHolder(partialRight));return createWrap(func,WRAP_PARTIAL_RIGHT_FLAG,undefined,partials,holders)});var rearg=flatRest(function(func,indexes){return createWrap(func,WRAP_REARG_FLAG,undefined,undefined,undefined,indexes)});function rest(func,start){if(typeof func!="function"){throw new TypeError(FUNC_ERROR_TEXT)}start=start===undefined?start:toInteger(start);return baseRest(func,start)}function spread(func,start){if(typeof func!="function"){throw new TypeError(FUNC_ERROR_TEXT)}start=start==null?0:nativeMax(toInteger(start),0);return baseRest(function(args){var array=args[start],otherArgs=castSlice(args,0,start);if(array){arrayPush(otherArgs,array)}return apply(func,this,otherArgs)})}function throttle(func,wait,options){var leading=true,trailing=true;if(typeof func!="function"){throw new TypeError(FUNC_ERROR_TEXT)}if(isObject(options)){leading="leading"in options?!!options.leading:leading;trailing="trailing"in options?!!options.trailing:trailing}return debounce(func,wait,{leading:leading,maxWait:wait,trailing:trailing})}function unary(func){return ary(func,1)}function wrap(value,wrapper){return partial(castFunction(wrapper),value)}function castArray(){if(!arguments.length){return[]}var value=arguments[0];return isArray(value)?value:[value]}function clone(value){return baseClone(value,CLONE_SYMBOLS_FLAG)}function cloneWith(value,customizer){customizer=typeof customizer=="function"?customizer:undefined;return baseClone(value,CLONE_SYMBOLS_FLAG,customizer)}function cloneDeep(value){return baseClone(value,CLONE_DEEP_FLAG|CLONE_SYMBOLS_FLAG)}function cloneDeepWith(value,customizer){customizer=typeof customizer=="function"?customizer:undefined;return baseClone(value,CLONE_DEEP_FLAG|CLONE_SYMBOLS_FLAG,customizer)}function conformsTo(object,source){return source==null||baseConformsTo(object,source,keys(source))}function eq(value,other){return value===other||value!==value&&other!==other}var gt=createRelationalOperation(baseGt);var gte=createRelationalOperation(function(value,other){return value>=other});var isArguments=baseIsArguments(function(){return arguments}())?baseIsArguments:function(value){return isObjectLike(value)&&hasOwnProperty.call(value,"callee")&&!propertyIsEnumerable.call(value,"callee")};var isArray=Array.isArray;var isArrayBuffer=nodeIsArrayBuffer?baseUnary(nodeIsArrayBuffer):baseIsArrayBuffer;function isArrayLike(value){return value!=null&&isLength(value.length)&&!isFunction(value)}function isArrayLikeObject(value){return isObjectLike(value)&&isArrayLike(value)}function isBoolean(value){return value===true||value===false||isObjectLike(value)&&baseGetTag(value)==boolTag}var isBuffer=nativeIsBuffer||stubFalse;var isDate=nodeIsDate?baseUnary(nodeIsDate):baseIsDate;function isElement(value){return isObjectLike(value)&&value.nodeType===1&&!isPlainObject(value)}function isEmpty(value){if(value==null){return true}if(isArrayLike(value)&&(isArray(value)||typeof value=="string"||typeof value.splice=="function"||isBuffer(value)||isTypedArray(value)||isArguments(value))){return!value.length}var tag=getTag(value);if(tag==mapTag||tag==setTag){return!value.size}if(isPrototype(value)){return!baseKeys(value).length}for(var key in value){if(hasOwnProperty.call(value,key)){return false}}return true}function isEqual(value,other){return baseIsEqual(value,other)}function isEqualWith(value,other,customizer){customizer=typeof customizer=="function"?customizer:undefined;var result=customizer?customizer(value,other):undefined;return result===undefined?baseIsEqual(value,other,undefined,customizer):!!result}function isError(value){if(!isObjectLike(value)){return false}var tag=baseGetTag(value);return tag==errorTag||tag==domExcTag||typeof value.message=="string"&&typeof value.name=="string"&&!isPlainObject(value)}function isFinite(value){return typeof value=="number"&&nativeIsFinite(value)}function isFunction(value){if(!isObject(value)){return false}var tag=baseGetTag(value);return tag==funcTag||tag==genTag||tag==asyncTag||tag==proxyTag}function isInteger(value){return typeof value=="number"&&value==toInteger(value)}function isLength(value){return typeof value=="number"&&value>-1&&value%1==0&&value<=MAX_SAFE_INTEGER}function isObject(value){var type=typeof value;return value!=null&&(type=="object"||type=="function")}function isObjectLike(value){return value!=null&&typeof value=="object"}var isMap=nodeIsMap?baseUnary(nodeIsMap):baseIsMap;function isMatch(object,source){return object===source||baseIsMatch(object,source,getMatchData(source))}function isMatchWith(object,source,customizer){customizer=typeof customizer=="function"?customizer:undefined;return baseIsMatch(object,source,getMatchData(source),customizer)}function isNaN(value){return isNumber(value)&&value!=+value}function isNative(value){if(isMaskable(value)){throw new Error(CORE_ERROR_TEXT)}return baseIsNative(value)}function isNull(value){return value===null}function isNil(value){return value==null}function isNumber(value){return typeof value=="number"||isObjectLike(value)&&baseGetTag(value)==numberTag}function isPlainObject(value){if(!isObjectLike(value)||baseGetTag(value)!=objectTag){return false}var proto=getPrototype(value);if(proto===null){return true}var Ctor=hasOwnProperty.call(proto,"constructor")&&proto.constructor;return typeof Ctor=="function"&&Ctor instanceof Ctor&&funcToString.call(Ctor)==objectCtorString}var isRegExp=nodeIsRegExp?baseUnary(nodeIsRegExp):baseIsRegExp;function isSafeInteger(value){return isInteger(value)&&value>=-MAX_SAFE_INTEGER&&value<=MAX_SAFE_INTEGER}var isSet=nodeIsSet?baseUnary(nodeIsSet):baseIsSet;function isString(value){return typeof value=="string"||!isArray(value)&&isObjectLike(value)&&baseGetTag(value)==stringTag}function isSymbol(value){return typeof value=="symbol"||isObjectLike(value)&&baseGetTag(value)==symbolTag}var isTypedArray=nodeIsTypedArray?baseUnary(nodeIsTypedArray):baseIsTypedArray;function isUndefined(value){return value===undefined}function isWeakMap(value){return isObjectLike(value)&&getTag(value)==weakMapTag}function isWeakSet(value){return isObjectLike(value)&&baseGetTag(value)==weakSetTag}var lt=createRelationalOperation(baseLt);var lte=createRelationalOperation(function(value,other){return value<=other});function toArray(value){if(!value){return[]}if(isArrayLike(value)){return isString(value)?stringToArray(value):copyArray(value)}if(symIterator&&value[symIterator]){return iteratorToArray(value[symIterator]())}var tag=getTag(value),func=tag==mapTag?mapToArray:tag==setTag?setToArray:values;return func(value)}function toFinite(value){if(!value){return value===0?value:0}value=toNumber(value);if(value===INFINITY||value===-INFINITY){var sign=value<0?-1:1;return sign*MAX_INTEGER}return value===value?value:0}function toInteger(value){var result=toFinite(value),remainder=result%1;return result===result?remainder?result-remainder:result:0}function toLength(value){return value?baseClamp(toInteger(value),0,MAX_ARRAY_LENGTH):0}function toNumber(value){if(typeof value=="number"){return value}if(isSymbol(value)){return NAN}if(isObject(value)){var other=typeof value.valueOf=="function"?value.valueOf():value;value=isObject(other)?other+"":other}if(typeof value!="string"){return value===0?value:+value}value=value.replace(reTrim,"");var isBinary=reIsBinary.test(value);return isBinary||reIsOctal.test(value)?freeParseInt(value.slice(2),isBinary?2:8):reIsBadHex.test(value)?NAN:+value}function toPlainObject(value){return copyObject(value,keysIn(value))}function toSafeInteger(value){return value?baseClamp(toInteger(value),-MAX_SAFE_INTEGER,MAX_SAFE_INTEGER):value===0?value:0}function toString(value){return value==null?"":baseToString(value)}var assign=createAssigner(function(object,source){if(isPrototype(source)||isArrayLike(source)){copyObject(source,keys(source),object);return}for(var key in source){if(hasOwnProperty.call(source,key)){assignValue(object,key,source[key])}}});var assignIn=createAssigner(function(object,source){copyObject(source,keysIn(source),object)});var assignInWith=createAssigner(function(object,source,srcIndex,customizer){copyObject(source,keysIn(source),object,customizer)});var assignWith=createAssigner(function(object,source,srcIndex,customizer){copyObject(source,keys(source),object,customizer)});var at=flatRest(baseAt);function create(prototype,properties){var result=baseCreate(prototype);return properties==null?result:baseAssign(result,properties)}var defaults=baseRest(function(args){args.push(undefined,customDefaultsAssignIn);return apply(assignInWith,undefined,args)});var defaultsDeep=baseRest(function(args){args.push(undefined,customDefaultsMerge);return apply(mergeWith,undefined,args)});function findKey(object,predicate){return baseFindKey(object,getIteratee(predicate,3),baseForOwn)}function findLastKey(object,predicate){return baseFindKey(object,getIteratee(predicate,3),baseForOwnRight)}function forIn(object,iteratee){return object==null?object:baseFor(object,getIteratee(iteratee,3),keysIn)}function forInRight(object,iteratee){return object==null?object:baseForRight(object,getIteratee(iteratee,3),keysIn)}function forOwn(object,iteratee){return object&&baseForOwn(object,getIteratee(iteratee,3))}function forOwnRight(object,iteratee){return object&&baseForOwnRight(object,getIteratee(iteratee,3))}function functions(object){return object==null?[]:baseFunctions(object,keys(object))}function functionsIn(object){return object==null?[]:baseFunctions(object,keysIn(object))}function get(object,path,defaultValue){var result=object==null?undefined:baseGet(object,path);return result===undefined?defaultValue:result}function has(object,path){return object!=null&&hasPath(object,path,baseHas)}function hasIn(object,path){return object!=null&&hasPath(object,path,baseHasIn)}var invert=createInverter(function(result,value,key){result[value]=key},constant(identity));var invertBy=createInverter(function(result,value,key){if(hasOwnProperty.call(result,value)){result[value].push(key)}else{result[value]=[key]}},getIteratee);var invoke=baseRest(baseInvoke);function keys(object){return isArrayLike(object)?arrayLikeKeys(object):baseKeys(object)}function keysIn(object){return isArrayLike(object)?arrayLikeKeys(object,true):baseKeysIn(object)}function mapKeys(object,iteratee){var result={};iteratee=getIteratee(iteratee,3);baseForOwn(object,function(value,key,object){baseAssignValue(result,iteratee(value,key,object),value)});return result}function mapValues(object,iteratee){var result={};iteratee=getIteratee(iteratee,3);baseForOwn(object,function(value,key,object){baseAssignValue(result,key,iteratee(value,key,object))});return result}var merge=createAssigner(function(object,source,srcIndex){baseMerge(object,source,srcIndex)});var mergeWith=createAssigner(function(object,source,srcIndex,customizer){baseMerge(object,source,srcIndex,customizer)});var omit=flatRest(function(object,paths){var result={};if(object==null){return result}var isDeep=false;paths=arrayMap(paths,function(path){path=castPath(path,object);isDeep||(isDeep=path.length>1);return path});copyObject(object,getAllKeysIn(object),result);if(isDeep){result=baseClone(result,CLONE_DEEP_FLAG|CLONE_FLAT_FLAG|CLONE_SYMBOLS_FLAG,customOmitClone)}var length=paths.length;while(length--){baseUnset(result,paths[length])}return result});function omitBy(object,predicate){return pickBy(object,negate(getIteratee(predicate)))}var pick=flatRest(function(object,paths){return object==null?{}:basePick(object,paths)});function pickBy(object,predicate){if(object==null){return{}}var props=arrayMap(getAllKeysIn(object),function(prop){return[prop]});predicate=getIteratee(predicate);return basePickBy(object,props,function(value,path){return predicate(value,path[0])})}function result(object,path,defaultValue){path=castPath(path,object);var index=-1,length=path.length;if(!length){length=1;object=undefined}while(++index<length){var value=object==null?undefined:object[toKey(path[index])];if(value===undefined){index=length;value=defaultValue}object=isFunction(value)?value.call(object):value}return object}function set(object,path,value){return object==null?object:baseSet(object,path,value)}function setWith(object,path,value,customizer){customizer=typeof customizer=="function"?customizer:undefined;return object==null?object:baseSet(object,path,value,customizer)}var toPairs=createToPairs(keys);var toPairsIn=createToPairs(keysIn);function transform(object,iteratee,accumulator){var isArr=isArray(object),isArrLike=isArr||isBuffer(object)||isTypedArray(object);iteratee=getIteratee(iteratee,4);if(accumulator==null){var Ctor=object&&object.constructor;if(isArrLike){accumulator=isArr?new Ctor:[]}else if(isObject(object)){accumulator=isFunction(Ctor)?baseCreate(getPrototype(object)):{}}else{accumulator={}}}(isArrLike?arrayEach:baseForOwn)(object,function(value,index,object){return iteratee(accumulator,value,index,object)});return accumulator}function unset(object,path){return object==null?true:baseUnset(object,path)}function update(object,path,updater){return object==null?object:baseUpdate(object,path,castFunction(updater))}function updateWith(object,path,updater,customizer){customizer=typeof customizer=="function"?customizer:undefined;return object==null?object:baseUpdate(object,path,castFunction(updater),customizer)}function values(object){return object==null?[]:baseValues(object,keys(object))}function valuesIn(object){return object==null?[]:baseValues(object,keysIn(object))}function clamp(number,lower,upper){if(upper===undefined){upper=lower;lower=undefined}if(upper!==undefined){upper=toNumber(upper);upper=upper===upper?upper:0}if(lower!==undefined){lower=toNumber(lower);lower=lower===lower?lower:0}return baseClamp(toNumber(number),lower,upper)}function inRange(number,start,end){start=toFinite(start);if(end===undefined){end=start;start=0}else{end=toFinite(end)}number=toNumber(number);return baseInRange(number,start,end)}function random(lower,upper,floating){if(floating&&typeof floating!="boolean"&&isIterateeCall(lower,upper,floating)){upper=floating=undefined}if(floating===undefined){if(typeof upper=="boolean"){floating=upper;upper=undefined}else if(typeof lower=="boolean"){floating=lower;lower=undefined}}if(lower===undefined&&upper===undefined){lower=0;upper=1}else{lower=toFinite(lower);if(upper===undefined){upper=lower;lower=0}else{upper=toFinite(upper)}}if(lower>upper){var temp=lower;lower=upper;upper=temp}if(floating||lower%1||upper%1){var rand=nativeRandom();return nativeMin(lower+rand*(upper-lower+freeParseFloat("1e-"+((rand+"").length-1))),upper)}return baseRandom(lower,upper)}var camelCase=createCompounder(function(result,word,index){word=word.toLowerCase();return result+(index?capitalize(word):word)});function capitalize(string){return upperFirst(toString(string).toLowerCase())}function deburr(string){string=toString(string);return string&&string.replace(reLatin,deburrLetter).replace(reComboMark,"")}function endsWith(string,target,position){string=toString(string);target=baseToString(target);var length=string.length;position=position===undefined?length:baseClamp(toInteger(position),0,length);var end=position;position-=target.length;return position>=0&&string.slice(position,end)==target}function escape(string){string=toString(string);return string&&reHasUnescapedHtml.test(string)?string.replace(reUnescapedHtml,escapeHtmlChar):string}function escapeRegExp(string){string=toString(string);return string&&reHasRegExpChar.test(string)?string.replace(reRegExpChar,"\\$&"):string}var kebabCase=createCompounder(function(result,word,index){return result+(index?"-":"")+word.toLowerCase()});var lowerCase=createCompounder(function(result,word,index){return result+(index?" ":"")+word.toLowerCase()});var lowerFirst=createCaseFirst("toLowerCase");function pad(string,length,chars){string=toString(string);length=toInteger(length);var strLength=length?stringSize(string):0;if(!length||strLength>=length){return string}var mid=(length-strLength)/2;return createPadding(nativeFloor(mid),chars)+string+createPadding(nativeCeil(mid),chars)}function padEnd(string,length,chars){string=toString(string);length=toInteger(length);var strLength=length?stringSize(string):0;return length&&strLength<length?string+createPadding(length-strLength,chars):string}function padStart(string,length,chars){string=toString(string);length=toInteger(length);var strLength=length?stringSize(string):0;return length&&strLength<length?createPadding(length-strLength,chars)+string:string}function parseInt(string,radix,guard){if(guard||radix==null){radix=0}else if(radix){radix=+radix}return nativeParseInt(toString(string).replace(reTrimStart,""),radix||0)}function repeat(string,n,guard){if(guard?isIterateeCall(string,n,guard):n===undefined){n=1}else{n=toInteger(n)}return baseRepeat(toString(string),n)}function replace(){var args=arguments,string=toString(args[0]);return args.length<3?string:string.replace(args[1],args[2])}var snakeCase=createCompounder(function(result,word,index){return result+(index?"_":"")+word.toLowerCase()});function split(string,separator,limit){if(limit&&typeof limit!="number"&&isIterateeCall(string,separator,limit)){separator=limit=undefined}limit=limit===undefined?MAX_ARRAY_LENGTH:limit>>>0;if(!limit){return[]}string=toString(string);if(string&&(typeof separator=="string"||separator!=null&&!isRegExp(separator))){separator=baseToString(separator);if(!separator&&hasUnicode(string)){return castSlice(stringToArray(string),0,limit)}}return string.split(separator,limit)}var startCase=createCompounder(function(result,word,index){return result+(index?" ":"")+upperFirst(word)});function startsWith(string,target,position){string=toString(string);position=position==null?0:baseClamp(toInteger(position),0,string.length);target=baseToString(target);return string.slice(position,position+target.length)==target}function template(string,options,guard){var settings=lodash.templateSettings;if(guard&&isIterateeCall(string,options,guard)){options=undefined}string=toString(string);options=assignInWith({},options,settings,customDefaultsAssignIn);var imports=assignInWith({},options.imports,settings.imports,customDefaultsAssignIn),importsKeys=keys(imports),importsValues=baseValues(imports,importsKeys);var isEscaping,isEvaluating,index=0,interpolate=options.interpolate||reNoMatch,source="__p += '";var reDelimiters=RegExp((options.escape||reNoMatch).source+"|"+interpolate.source+"|"+(interpolate===reInterpolate?reEsTemplate:reNoMatch).source+"|"+(options.evaluate||reNoMatch).source+"|$","g");var sourceURL="//# sourceURL="+("sourceURL"in options?options.sourceURL:"lodash.templateSources["+ ++templateCounter+"]")+"\n";string.replace(reDelimiters,function(match,escapeValue,interpolateValue,esTemplateValue,evaluateValue,offset){interpolateValue||(interpolateValue=esTemplateValue);source+=string.slice(index,offset).replace(reUnescapedString,escapeStringChar);if(escapeValue){isEscaping=true;source+="' +\n__e("+escapeValue+") +\n'"}if(evaluateValue){isEvaluating=true;source+="';\n"+evaluateValue+";\n__p += '"}if(interpolateValue){source+="' +\n((__t = ("+interpolateValue+")) == null ? '' : __t) +\n'"}index=offset+match.length;return match});source+="';\n";var variable=options.variable;if(!variable){source="with (obj) {\n"+source+"\n}\n"}source=(isEvaluating?source.replace(reEmptyStringLeading,""):source).replace(reEmptyStringMiddle,"$1").replace(reEmptyStringTrailing,"$1;");source="function("+(variable||"obj")+") {\n"+(variable?"":"obj || (obj = {});\n")+"var __t, __p = ''"+(isEscaping?", __e = _.escape":"")+(isEvaluating?", __j = Array.prototype.join;\n"+"function print() { __p += __j.call(arguments, '') }\n":";\n")+source+"return __p\n}";var result=attempt(function(){return Function(importsKeys,sourceURL+"return "+source).apply(undefined,importsValues)});result.source=source;if(isError(result)){throw result}return result}function toLower(value){return toString(value).toLowerCase()}function toUpper(value){return toString(value).toUpperCase()}function trim(string,chars,guard){string=toString(string);if(string&&(guard||chars===undefined)){return string.replace(reTrim,"")}if(!string||!(chars=baseToString(chars))){return string}var strSymbols=stringToArray(string),chrSymbols=stringToArray(chars),start=charsStartIndex(strSymbols,chrSymbols),end=charsEndIndex(strSymbols,chrSymbols)+1;return castSlice(strSymbols,start,end).join("")}function trimEnd(string,chars,guard){string=toString(string);if(string&&(guard||chars===undefined)){return string.replace(reTrimEnd,"")}if(!string||!(chars=baseToString(chars))){return string}var strSymbols=stringToArray(string),end=charsEndIndex(strSymbols,stringToArray(chars))+1;return castSlice(strSymbols,0,end).join("")}function trimStart(string,chars,guard){string=toString(string);if(string&&(guard||chars===undefined)){return string.replace(reTrimStart,"")}if(!string||!(chars=baseToString(chars))){return string}var strSymbols=stringToArray(string),start=charsStartIndex(strSymbols,stringToArray(chars));return castSlice(strSymbols,start).join("")}function truncate(string,options){var length=DEFAULT_TRUNC_LENGTH,omission=DEFAULT_TRUNC_OMISSION;if(isObject(options)){var separator="separator"in options?options.separator:separator;length="length"in options?toInteger(options.length):length;omission="omission"in options?baseToString(options.omission):omission}string=toString(string);var strLength=string.length;if(hasUnicode(string)){var strSymbols=stringToArray(string);strLength=strSymbols.length}if(length>=strLength){return string}var end=length-stringSize(omission);if(end<1){return omission}var result=strSymbols?castSlice(strSymbols,0,end).join(""):string.slice(0,end);if(separator===undefined){return result+omission}if(strSymbols){end+=result.length-end}if(isRegExp(separator)){if(string.slice(end).search(separator)){var match,substring=result;if(!separator.global){separator=RegExp(separator.source,toString(reFlags.exec(separator))+"g")}separator.lastIndex=0;while(match=separator.exec(substring)){var newEnd=match.index}result=result.slice(0,newEnd===undefined?end:newEnd)}}else if(string.indexOf(baseToString(separator),end)!=end){var index=result.lastIndexOf(separator);if(index>-1){result=result.slice(0,index)}}return result+omission}function unescape(string){string=toString(string);return string&&reHasEscapedHtml.test(string)?string.replace(reEscapedHtml,unescapeHtmlChar):string}var upperCase=createCompounder(function(result,word,index){return result+(index?" ":"")+word.toUpperCase()});var upperFirst=createCaseFirst("toUpperCase");function words(string,pattern,guard){string=toString(string);pattern=guard?undefined:pattern;if(pattern===undefined){return hasUnicodeWord(string)?unicodeWords(string):asciiWords(string)}return string.match(pattern)||[]}var attempt=baseRest(function(func,args){try{return apply(func,undefined,args)}catch(e){return isError(e)?e:new Error(e)}});var bindAll=flatRest(function(object,methodNames){arrayEach(methodNames,function(key){key=toKey(key);baseAssignValue(object,key,bind(object[key],object))});return object});function cond(pairs){var length=pairs==null?0:pairs.length,toIteratee=getIteratee();pairs=!length?[]:arrayMap(pairs,function(pair){if(typeof pair[1]!="function"){throw new TypeError(FUNC_ERROR_TEXT)}return[toIteratee(pair[0]),pair[1]]});return baseRest(function(args){var index=-1;while(++index<length){var pair=pairs[index];if(apply(pair[0],this,args)){return apply(pair[1],this,args)}}})}function conforms(source){return baseConforms(baseClone(source,CLONE_DEEP_FLAG))}function constant(value){return function(){return value}}function defaultTo(value,defaultValue){return value==null||value!==value?defaultValue:value}var flow=createFlow();var flowRight=createFlow(true);function identity(value){return value}function iteratee(func){return baseIteratee(typeof func=="function"?func:baseClone(func,CLONE_DEEP_FLAG))}function matches(source){return baseMatches(baseClone(source,CLONE_DEEP_FLAG))}function matchesProperty(path,srcValue){return baseMatchesProperty(path,baseClone(srcValue,CLONE_DEEP_FLAG))}var method=baseRest(function(path,args){return function(object){return baseInvoke(object,path,args)}});var methodOf=baseRest(function(object,args){
return function(path){return baseInvoke(object,path,args)}});function mixin(object,source,options){var props=keys(source),methodNames=baseFunctions(source,props);if(options==null&&!(isObject(source)&&(methodNames.length||!props.length))){options=source;source=object;object=this;methodNames=baseFunctions(source,keys(source))}var chain=!(isObject(options)&&"chain"in options)||!!options.chain,isFunc=isFunction(object);arrayEach(methodNames,function(methodName){var func=source[methodName];object[methodName]=func;if(isFunc){object.prototype[methodName]=function(){var chainAll=this.__chain__;if(chain||chainAll){var result=object(this.__wrapped__),actions=result.__actions__=copyArray(this.__actions__);actions.push({func:func,args:arguments,thisArg:object});result.__chain__=chainAll;return result}return func.apply(object,arrayPush([this.value()],arguments))}}});return object}function noConflict(){if(root._===this){root._=oldDash}return this}function noop(){}function nthArg(n){n=toInteger(n);return baseRest(function(args){return baseNth(args,n)})}var over=createOver(arrayMap);var overEvery=createOver(arrayEvery);var overSome=createOver(arraySome);function property(path){return isKey(path)?baseProperty(toKey(path)):basePropertyDeep(path)}function propertyOf(object){return function(path){return object==null?undefined:baseGet(object,path)}}var range=createRange();var rangeRight=createRange(true);function stubArray(){return[]}function stubFalse(){return false}function stubObject(){return{}}function stubString(){return""}function stubTrue(){return true}function times(n,iteratee){n=toInteger(n);if(n<1||n>MAX_SAFE_INTEGER){return[]}var index=MAX_ARRAY_LENGTH,length=nativeMin(n,MAX_ARRAY_LENGTH);iteratee=getIteratee(iteratee);n-=MAX_ARRAY_LENGTH;var result=baseTimes(length,iteratee);while(++index<n){iteratee(index)}return result}function toPath(value){if(isArray(value)){return arrayMap(value,toKey)}return isSymbol(value)?[value]:copyArray(stringToPath(toString(value)))}function uniqueId(prefix){var id=++idCounter;return toString(prefix)+id}var add=createMathOperation(function(augend,addend){return augend+addend},0);var ceil=createRound("ceil");var divide=createMathOperation(function(dividend,divisor){return dividend/divisor},1);var floor=createRound("floor");function max(array){return array&&array.length?baseExtremum(array,identity,baseGt):undefined}function maxBy(array,iteratee){return array&&array.length?baseExtremum(array,getIteratee(iteratee,2),baseGt):undefined}function mean(array){return baseMean(array,identity)}function meanBy(array,iteratee){return baseMean(array,getIteratee(iteratee,2))}function min(array){return array&&array.length?baseExtremum(array,identity,baseLt):undefined}function minBy(array,iteratee){return array&&array.length?baseExtremum(array,getIteratee(iteratee,2),baseLt):undefined}var multiply=createMathOperation(function(multiplier,multiplicand){return multiplier*multiplicand},1);var round=createRound("round");var subtract=createMathOperation(function(minuend,subtrahend){return minuend-subtrahend},0);function sum(array){return array&&array.length?baseSum(array,identity):0}function sumBy(array,iteratee){return array&&array.length?baseSum(array,getIteratee(iteratee,2)):0}lodash.after=after;lodash.ary=ary;lodash.assign=assign;lodash.assignIn=assignIn;lodash.assignInWith=assignInWith;lodash.assignWith=assignWith;lodash.at=at;lodash.before=before;lodash.bind=bind;lodash.bindAll=bindAll;lodash.bindKey=bindKey;lodash.castArray=castArray;lodash.chain=chain;lodash.chunk=chunk;lodash.compact=compact;lodash.concat=concat;lodash.cond=cond;lodash.conforms=conforms;lodash.constant=constant;lodash.countBy=countBy;lodash.create=create;lodash.curry=curry;lodash.curryRight=curryRight;lodash.debounce=debounce;lodash.defaults=defaults;lodash.defaultsDeep=defaultsDeep;lodash.defer=defer;lodash.delay=delay;lodash.difference=difference;lodash.differenceBy=differenceBy;lodash.differenceWith=differenceWith;lodash.drop=drop;lodash.dropRight=dropRight;lodash.dropRightWhile=dropRightWhile;lodash.dropWhile=dropWhile;lodash.fill=fill;lodash.filter=filter;lodash.flatMap=flatMap;lodash.flatMapDeep=flatMapDeep;lodash.flatMapDepth=flatMapDepth;lodash.flatten=flatten;lodash.flattenDeep=flattenDeep;lodash.flattenDepth=flattenDepth;lodash.flip=flip;lodash.flow=flow;lodash.flowRight=flowRight;lodash.fromPairs=fromPairs;lodash.functions=functions;lodash.functionsIn=functionsIn;lodash.groupBy=groupBy;lodash.initial=initial;lodash.intersection=intersection;lodash.intersectionBy=intersectionBy;lodash.intersectionWith=intersectionWith;lodash.invert=invert;lodash.invertBy=invertBy;lodash.invokeMap=invokeMap;lodash.iteratee=iteratee;lodash.keyBy=keyBy;lodash.keys=keys;lodash.keysIn=keysIn;lodash.map=map;lodash.mapKeys=mapKeys;lodash.mapValues=mapValues;lodash.matches=matches;lodash.matchesProperty=matchesProperty;lodash.memoize=memoize;lodash.merge=merge;lodash.mergeWith=mergeWith;lodash.method=method;lodash.methodOf=methodOf;lodash.mixin=mixin;lodash.negate=negate;lodash.nthArg=nthArg;lodash.omit=omit;lodash.omitBy=omitBy;lodash.once=once;lodash.orderBy=orderBy;lodash.over=over;lodash.overArgs=overArgs;lodash.overEvery=overEvery;lodash.overSome=overSome;lodash.partial=partial;lodash.partialRight=partialRight;lodash.partition=partition;lodash.pick=pick;lodash.pickBy=pickBy;lodash.property=property;lodash.propertyOf=propertyOf;lodash.pull=pull;lodash.pullAll=pullAll;lodash.pullAllBy=pullAllBy;lodash.pullAllWith=pullAllWith;lodash.pullAt=pullAt;lodash.range=range;lodash.rangeRight=rangeRight;lodash.rearg=rearg;lodash.reject=reject;lodash.remove=remove;lodash.rest=rest;lodash.reverse=reverse;lodash.sampleSize=sampleSize;lodash.set=set;lodash.setWith=setWith;lodash.shuffle=shuffle;lodash.slice=slice;lodash.sortBy=sortBy;lodash.sortedUniq=sortedUniq;lodash.sortedUniqBy=sortedUniqBy;lodash.split=split;lodash.spread=spread;lodash.tail=tail;lodash.take=take;lodash.takeRight=takeRight;lodash.takeRightWhile=takeRightWhile;lodash.takeWhile=takeWhile;lodash.tap=tap;lodash.throttle=throttle;lodash.thru=thru;lodash.toArray=toArray;lodash.toPairs=toPairs;lodash.toPairsIn=toPairsIn;lodash.toPath=toPath;lodash.toPlainObject=toPlainObject;lodash.transform=transform;lodash.unary=unary;lodash.union=union;lodash.unionBy=unionBy;lodash.unionWith=unionWith;lodash.uniq=uniq;lodash.uniqBy=uniqBy;lodash.uniqWith=uniqWith;lodash.unset=unset;lodash.unzip=unzip;lodash.unzipWith=unzipWith;lodash.update=update;lodash.updateWith=updateWith;lodash.values=values;lodash.valuesIn=valuesIn;lodash.without=without;lodash.words=words;lodash.wrap=wrap;lodash.xor=xor;lodash.xorBy=xorBy;lodash.xorWith=xorWith;lodash.zip=zip;lodash.zipObject=zipObject;lodash.zipObjectDeep=zipObjectDeep;lodash.zipWith=zipWith;lodash.entries=toPairs;lodash.entriesIn=toPairsIn;lodash.extend=assignIn;lodash.extendWith=assignInWith;mixin(lodash,lodash);lodash.add=add;lodash.attempt=attempt;lodash.camelCase=camelCase;lodash.capitalize=capitalize;lodash.ceil=ceil;lodash.clamp=clamp;lodash.clone=clone;lodash.cloneDeep=cloneDeep;lodash.cloneDeepWith=cloneDeepWith;lodash.cloneWith=cloneWith;lodash.conformsTo=conformsTo;lodash.deburr=deburr;lodash.defaultTo=defaultTo;lodash.divide=divide;lodash.endsWith=endsWith;lodash.eq=eq;lodash.escape=escape;lodash.escapeRegExp=escapeRegExp;lodash.every=every;lodash.find=find;lodash.findIndex=findIndex;lodash.findKey=findKey;lodash.findLast=findLast;lodash.findLastIndex=findLastIndex;lodash.findLastKey=findLastKey;lodash.floor=floor;lodash.forEach=forEach;lodash.forEachRight=forEachRight;lodash.forIn=forIn;lodash.forInRight=forInRight;lodash.forOwn=forOwn;lodash.forOwnRight=forOwnRight;lodash.get=get;lodash.gt=gt;lodash.gte=gte;lodash.has=has;lodash.hasIn=hasIn;lodash.head=head;lodash.identity=identity;lodash.includes=includes;lodash.indexOf=indexOf;lodash.inRange=inRange;lodash.invoke=invoke;lodash.isArguments=isArguments;lodash.isArray=isArray;lodash.isArrayBuffer=isArrayBuffer;lodash.isArrayLike=isArrayLike;lodash.isArrayLikeObject=isArrayLikeObject;lodash.isBoolean=isBoolean;lodash.isBuffer=isBuffer;lodash.isDate=isDate;lodash.isElement=isElement;lodash.isEmpty=isEmpty;lodash.isEqual=isEqual;lodash.isEqualWith=isEqualWith;lodash.isError=isError;lodash.isFinite=isFinite;lodash.isFunction=isFunction;lodash.isInteger=isInteger;lodash.isLength=isLength;lodash.isMap=isMap;lodash.isMatch=isMatch;lodash.isMatchWith=isMatchWith;lodash.isNaN=isNaN;lodash.isNative=isNative;lodash.isNil=isNil;lodash.isNull=isNull;lodash.isNumber=isNumber;lodash.isObject=isObject;lodash.isObjectLike=isObjectLike;lodash.isPlainObject=isPlainObject;lodash.isRegExp=isRegExp;lodash.isSafeInteger=isSafeInteger;lodash.isSet=isSet;lodash.isString=isString;lodash.isSymbol=isSymbol;lodash.isTypedArray=isTypedArray;lodash.isUndefined=isUndefined;lodash.isWeakMap=isWeakMap;lodash.isWeakSet=isWeakSet;lodash.join=join;lodash.kebabCase=kebabCase;lodash.last=last;lodash.lastIndexOf=lastIndexOf;lodash.lowerCase=lowerCase;lodash.lowerFirst=lowerFirst;lodash.lt=lt;lodash.lte=lte;lodash.max=max;lodash.maxBy=maxBy;lodash.mean=mean;lodash.meanBy=meanBy;lodash.min=min;lodash.minBy=minBy;lodash.stubArray=stubArray;lodash.stubFalse=stubFalse;lodash.stubObject=stubObject;lodash.stubString=stubString;lodash.stubTrue=stubTrue;lodash.multiply=multiply;lodash.nth=nth;lodash.noConflict=noConflict;lodash.noop=noop;lodash.now=now;lodash.pad=pad;lodash.padEnd=padEnd;lodash.padStart=padStart;lodash.parseInt=parseInt;lodash.random=random;lodash.reduce=reduce;lodash.reduceRight=reduceRight;lodash.repeat=repeat;lodash.replace=replace;lodash.result=result;lodash.round=round;lodash.runInContext=runInContext;lodash.sample=sample;lodash.size=size;lodash.snakeCase=snakeCase;lodash.some=some;lodash.sortedIndex=sortedIndex;lodash.sortedIndexBy=sortedIndexBy;lodash.sortedIndexOf=sortedIndexOf;lodash.sortedLastIndex=sortedLastIndex;lodash.sortedLastIndexBy=sortedLastIndexBy;lodash.sortedLastIndexOf=sortedLastIndexOf;lodash.startCase=startCase;lodash.startsWith=startsWith;lodash.subtract=subtract;lodash.sum=sum;lodash.sumBy=sumBy;lodash.template=template;lodash.times=times;lodash.toFinite=toFinite;lodash.toInteger=toInteger;lodash.toLength=toLength;lodash.toLower=toLower;lodash.toNumber=toNumber;lodash.toSafeInteger=toSafeInteger;lodash.toString=toString;lodash.toUpper=toUpper;lodash.trim=trim;lodash.trimEnd=trimEnd;lodash.trimStart=trimStart;lodash.truncate=truncate;lodash.unescape=unescape;lodash.uniqueId=uniqueId;lodash.upperCase=upperCase;lodash.upperFirst=upperFirst;lodash.each=forEach;lodash.eachRight=forEachRight;lodash.first=head;mixin(lodash,function(){var source={};baseForOwn(lodash,function(func,methodName){if(!hasOwnProperty.call(lodash.prototype,methodName)){source[methodName]=func}});return source}(),{chain:false});lodash.VERSION=VERSION;arrayEach(["bind","bindKey","curry","curryRight","partial","partialRight"],function(methodName){lodash[methodName].placeholder=lodash});arrayEach(["drop","take"],function(methodName,index){LazyWrapper.prototype[methodName]=function(n){n=n===undefined?1:nativeMax(toInteger(n),0);var result=this.__filtered__&&!index?new LazyWrapper(this):this.clone();if(result.__filtered__){result.__takeCount__=nativeMin(n,result.__takeCount__)}else{result.__views__.push({size:nativeMin(n,MAX_ARRAY_LENGTH),type:methodName+(result.__dir__<0?"Right":"")})}return result};LazyWrapper.prototype[methodName+"Right"]=function(n){return this.reverse()[methodName](n).reverse()}});arrayEach(["filter","map","takeWhile"],function(methodName,index){var type=index+1,isFilter=type==LAZY_FILTER_FLAG||type==LAZY_WHILE_FLAG;LazyWrapper.prototype[methodName]=function(iteratee){var result=this.clone();result.__iteratees__.push({iteratee:getIteratee(iteratee,3),type:type});result.__filtered__=result.__filtered__||isFilter;return result}});arrayEach(["head","last"],function(methodName,index){var takeName="take"+(index?"Right":"");LazyWrapper.prototype[methodName]=function(){return this[takeName](1).value()[0]}});arrayEach(["initial","tail"],function(methodName,index){var dropName="drop"+(index?"":"Right");LazyWrapper.prototype[methodName]=function(){return this.__filtered__?new LazyWrapper(this):this[dropName](1)}});LazyWrapper.prototype.compact=function(){return this.filter(identity)};LazyWrapper.prototype.find=function(predicate){return this.filter(predicate).head()};LazyWrapper.prototype.findLast=function(predicate){return this.reverse().find(predicate)};LazyWrapper.prototype.invokeMap=baseRest(function(path,args){if(typeof path=="function"){return new LazyWrapper(this)}return this.map(function(value){return baseInvoke(value,path,args)})});LazyWrapper.prototype.reject=function(predicate){return this.filter(negate(getIteratee(predicate)))};LazyWrapper.prototype.slice=function(start,end){start=toInteger(start);var result=this;if(result.__filtered__&&(start>0||end<0)){return new LazyWrapper(result)}if(start<0){result=result.takeRight(-start)}else if(start){result=result.drop(start)}if(end!==undefined){end=toInteger(end);result=end<0?result.dropRight(-end):result.take(end-start)}return result};LazyWrapper.prototype.takeRightWhile=function(predicate){return this.reverse().takeWhile(predicate).reverse()};LazyWrapper.prototype.toArray=function(){return this.take(MAX_ARRAY_LENGTH)};baseForOwn(LazyWrapper.prototype,function(func,methodName){var checkIteratee=/^(?:filter|find|map|reject)|While$/.test(methodName),isTaker=/^(?:head|last)$/.test(methodName),lodashFunc=lodash[isTaker?"take"+(methodName=="last"?"Right":""):methodName],retUnwrapped=isTaker||/^find/.test(methodName);if(!lodashFunc){return}lodash.prototype[methodName]=function(){var value=this.__wrapped__,args=isTaker?[1]:arguments,isLazy=value instanceof LazyWrapper,iteratee=args[0],useLazy=isLazy||isArray(value);var interceptor=function(value){var result=lodashFunc.apply(lodash,arrayPush([value],args));return isTaker&&chainAll?result[0]:result};if(useLazy&&checkIteratee&&typeof iteratee=="function"&&iteratee.length!=1){isLazy=useLazy=false}var chainAll=this.__chain__,isHybrid=!!this.__actions__.length,isUnwrapped=retUnwrapped&&!chainAll,onlyLazy=isLazy&&!isHybrid;if(!retUnwrapped&&useLazy){value=onlyLazy?value:new LazyWrapper(this);var result=func.apply(value,args);result.__actions__.push({func:thru,args:[interceptor],thisArg:undefined});return new LodashWrapper(result,chainAll)}if(isUnwrapped&&onlyLazy){return func.apply(this,args)}result=this.thru(interceptor);return isUnwrapped?isTaker?result.value()[0]:result.value():result}});arrayEach(["pop","push","shift","sort","splice","unshift"],function(methodName){var func=arrayProto[methodName],chainName=/^(?:push|sort|unshift)$/.test(methodName)?"tap":"thru",retUnwrapped=/^(?:pop|shift)$/.test(methodName);lodash.prototype[methodName]=function(){var args=arguments;if(retUnwrapped&&!this.__chain__){var value=this.value();return func.apply(isArray(value)?value:[],args)}return this[chainName](function(value){return func.apply(isArray(value)?value:[],args)})}});baseForOwn(LazyWrapper.prototype,function(func,methodName){var lodashFunc=lodash[methodName];if(lodashFunc){var key=lodashFunc.name+"",names=realNames[key]||(realNames[key]=[]);names.push({name:methodName,func:lodashFunc})}});realNames[createHybrid(undefined,WRAP_BIND_KEY_FLAG).name]=[{name:"wrapper",func:undefined}];LazyWrapper.prototype.clone=lazyClone;LazyWrapper.prototype.reverse=lazyReverse;LazyWrapper.prototype.value=lazyValue;lodash.prototype.at=wrapperAt;lodash.prototype.chain=wrapperChain;lodash.prototype.commit=wrapperCommit;lodash.prototype.next=wrapperNext;lodash.prototype.plant=wrapperPlant;lodash.prototype.reverse=wrapperReverse;lodash.prototype.toJSON=lodash.prototype.valueOf=lodash.prototype.value=wrapperValue;lodash.prototype.first=lodash.prototype.head;if(symIterator){lodash.prototype[symIterator]=wrapperToIterator}return lodash};var _=runInContext();if(typeof define=="function"&&typeof define.amd=="object"&&define.amd){root._=_;define(function(){return _})}else if(freeModule){(freeModule.exports=_)._=_;freeExports._=_}else{root._=_}}).call(this)}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{}]},{},[]);
    return require('lodash');
})();
  // end lodash
  var init_qtip_js = function() {
    return !function(a, b, c) {
      !function(a) {
        "function" == typeof define && define.amd ? define(["jquery"], a) : jQuery && !jQuery.fn.qtip && a(jQuery)
      }(function(d) {
        function e(a, b, c, e) {
          this.id = c,
          this.target = a,
          this.tooltip = F,
          this.elements = {
            target: a
          },
          this._id = S + "-" + c,
          this.timers = {
            img: {}
          },
          this.options = b,
          this.plugins = {},
          this.cache = {
            event: {},
            target: d(),
            disabled: E,
            attr: e,
            onTooltip: E,
            lastClass: ""
          },
          this.rendered = this.destroyed = this.disabled = this.waiting = this.hiddenDuringWait = this.positioning = this.triggering = E
        }
        function f(a) {
          return a === F || "object" !== d.type(a)
        }
        function g(a) {
          return !(d.isFunction(a) || a && a.attr || a.length || "object" === d.type(a) && (a.jquery || a.then))
        }
        function h(a) {
          var b, c, e, h;
          return f(a) ? E : (f(a.metadata) && (a.metadata = {
            type: a.metadata
          }),
          "content"in a && (b = a.content,
          f(b) || b.jquery || b.done ? (c = g(b) ? E : b,
          b = a.content = {
            text: c
          }) : c = b.text,
          "ajax"in b && (e = b.ajax,
          h = e && e.once !== E,
          delete b.ajax,
          b.text = function(a, b) {
            var f = c || d(this).attr(b.options.content.attr) || "Loading..."
              , g = d.ajax(d.extend({}, e, {
              context: b
            })).then(e.success, F, e.error).then(function(a) {
              return a && h && b.set("content.text", a),
              a
            }, function(a, c, d) {
              b.destroyed || 0 === a.status || b.set("content.text", c + ": " + d)
            });
            return h ? f : (b.set("content.text", f),
            g)
          }
          ),
          "title"in b && (d.isPlainObject(b.title) && (b.button = b.title.button,
          b.title = b.title.text),
          g(b.title || E) && (b.title = E))),
          "position"in a && f(a.position) && (a.position = {
            my: a.position,
            at: a.position
          }),
          "show"in a && f(a.show) && (a.show = a.show.jquery ? {
            target: a.show
          } : a.show === D ? {
            ready: D
          } : {
            event: a.show
          }),
          "hide"in a && f(a.hide) && (a.hide = a.hide.jquery ? {
            target: a.hide
          } : {
            event: a.hide
          }),
          "style"in a && f(a.style) && (a.style = {
            classes: a.style
          }),
          d.each(R, function() {
            this.sanitize && this.sanitize(a)
          }),
          a)
        }
        function i(a, b) {
          for (var c, d = 0, e = a, f = b.split("."); e = e[f[d++]]; )
            d < f.length && (c = e);
          return [c || a, f.pop()]
        }
        function j(a, b) {
          var c, d, e;
          for (c in this.checks)
            if (this.checks.hasOwnProperty(c))
              for (d in this.checks[c])
                this.checks[c].hasOwnProperty(d) && (e = new RegExp(d,"i").exec(a)) && (b.push(e),
                ("builtin" === c || this.plugins[c]) && this.checks[c][d].apply(this.plugins[c] || this, b))
        }
        function k(a) {
          return V.concat("").join(a ? "-" + a + " " : " ")
        }
        function l(a, b) {
          return b > 0 ? setTimeout(d.proxy(a, this), b) : void a.call(this)
        }
        function m(a) {
          this.tooltip.hasClass(aa) || (clearTimeout(this.timers.show),
          clearTimeout(this.timers.hide),
          this.timers.show = l.call(this, function() {
            this.toggle(D, a)
          }, this.options.show.delay))
        }
        function n(a) {
          if (!this.tooltip.hasClass(aa) && !this.destroyed) {
            var b = d(a.relatedTarget)
              , c = b.closest(W)[0] === this.tooltip[0]
              , e = b[0] === this.options.show.target[0];
            if (clearTimeout(this.timers.show),
            clearTimeout(this.timers.hide),
            this !== b[0] && "mouse" === this.options.position.target && c || this.options.hide.fixed && /mouse(out|leave|move)/.test(a.type) && (c || e))
              try {
                a.preventDefault(),
                a.stopImmediatePropagation()
              } catch (f) {}
            else
              this.timers.hide = l.call(this, function() {
                this.toggle(E, a)
              }, this.options.hide.delay, this)
          }
        }
        function o(a) {
          !this.tooltip.hasClass(aa) && this.options.hide.inactive && (clearTimeout(this.timers.inactive),
          this.timers.inactive = l.call(this, function() {
            this.hide(a)
          }, this.options.hide.inactive))
        }
        function p(a) {
          this.rendered && this.tooltip[0].offsetWidth > 0 && this.reposition(a)
        }
        function q(a, c, e) {
          d(b.body).delegate(a, (c.split ? c : c.join("." + S + " ")) + "." + S, function() {
            var a = y.api[d.attr(this, U)];
            a && !a.disabled && e.apply(a, arguments)
          })
        }
        function r(a, c, f) {
          var g, i, j, k, l, m = d(b.body), n = a[0] === b ? m : a, o = a.metadata ? a.metadata(f.metadata) : F, p = "html5" === f.metadata.type && o ? o[f.metadata.name] : F, q = a.data(f.metadata.name || "qtipopts");
          try {
            q = "string" == typeof q ? d.parseJSON(q) : q
          } catch (r) {}
          if (k = d.extend(D, {}, y.defaults, f, "object" == typeof q ? h(q) : F, h(p || o)),
          i = k.position,
          k.id = c,
          "boolean" == typeof k.content.text) {
            if (j = a.attr(k.content.attr),
            k.content.attr === E || !j)
              return E;
            k.content.text = j
          }
          if (i.container.length || (i.container = m),
          i.target === E && (i.target = n),
          k.show.target === E && (k.show.target = n),
          k.show.solo === D && (k.show.solo = i.container.closest("body")),
          k.hide.target === E && (k.hide.target = n),
          k.position.viewport === D && (k.position.viewport = i.container),
          i.container = i.container.eq(0),
          i.at = new A(i.at,D),
          i.my = new A(i.my),
          a.data(S))
            if (k.overwrite)
              a.qtip("destroy", !0);
            else if (k.overwrite === E)
              return E;
          return a.attr(T, c),
          k.suppress && (l = a.attr("title")) && a.removeAttr("title").attr(ca, l).attr("title", ""),
          g = new e(a,k,c,!!j),
          a.data(S, g),
          g
        }
        function s(a) {
          return a.charAt(0).toUpperCase() + a.slice(1)
        }
        function t(a, b) {
          var d, e, f = b.charAt(0).toUpperCase() + b.slice(1), g = (b + " " + va.join(f + " ") + f).split(" "), h = 0;
          if (ua[b])
            return a.css(ua[b]);
          for (; d = g[h++]; )
            if ((e = a.css(d)) !== c)
              return ua[b] = d,
              e
        }
        function u(a, b) {
          return Math.ceil(parseFloat(t(a, b)))
        }
        function v(a, b) {
          this._ns = "tip",
          this.options = b,
          this.offset = b.offset,
          this.size = [b.width, b.height],
          this.qtip = a,
          this.init(a)
        }
        function w(a, b) {
          this.options = b,
          this._ns = "-modal",
          this.qtip = a,
          this.init(a)
        }
        function x(a) {
          this._ns = "ie6",
          this.qtip = a,
          this.init(a)
        }
        var y, z, A, B, C, D = !0, E = !1, F = null, G = "x", H = "y", I = "width", J = "height", K = "top", L = "left", M = "bottom", N = "right", O = "center", P = "flipinvert", Q = "shift", R = {}, S = "qtip", T = "data-hasqtip", U = "data-qtip-id", V = ["ui-widget", "ui-tooltip"], W = "." + S, X = "click dblclick mousedown mouseup mousemove mouseleave mouseenter".split(" "), Y = S + "-fixed", Z = S + "-default", $ = S + "-focus", _ = S + "-hover", aa = S + "-disabled", ba = "_replacedByqTip", ca = "oldtitle", da = {
          ie: function() {
            var a, c;
            for (a = 4,
            c = b.createElement("div"); (c.innerHTML = "<!--[if gt IE " + a + "]><i></i><![endif]-->") && c.getElementsByTagName("i")[0]; a += 1)
              ;
            return a > 4 ? a : NaN
          }(),
          iOS: parseFloat(("" + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0, ""])[1]).replace("undefined", "3_2").replace("_", ".").replace("_", "")) || E
        };
        z = e.prototype,
        z._when = function(a) {
          return d.when.apply(d, a)
        }
        ,
        z.render = function(a) {
          if (this.rendered || this.destroyed)
            return this;
          var b = this
            , c = this.options
            , e = this.cache
            , f = this.elements
            , g = c.content.text
            , h = c.content.title
            , i = c.content.button
            , j = c.position
            , k = [];
          return d.attr(this.target[0], "aria-describedby", this._id),
          e.posClass = this._createPosClass((this.position = {
            my: j.my,
            at: j.at
          }).my),
          this.tooltip = f.tooltip = d("<div/>", {
            id: this._id,
            class: [S, Z, c.style.classes, e.posClass].join(" "),
            width: c.style.width || "",
            height: c.style.height || "",
            tracking: "mouse" === j.target && j.adjust.mouse,
            role: "alert",
            "aria-live": "polite",
            "aria-atomic": E,
            "aria-describedby": this._id + "-content",
            "aria-hidden": D
          }).toggleClass(aa, this.disabled).attr(U, this.id).data(S, this).appendTo(j.container).append(f.content = d("<div />", {
            class: S + "-content",
            id: this._id + "-content",
            "aria-atomic": D
          })),
          this.rendered = -1,
          this.positioning = D,
          h && (this._createTitle(),
          d.isFunction(h) || k.push(this._updateTitle(h, E))),
          i && this._createButton(),
          d.isFunction(g) || k.push(this._updateContent(g, E)),
          this.rendered = D,
          this._setWidget(),
          d.each(R, function(a) {
            var c;
            "render" === this.initialize && (c = this(b)) && (b.plugins[a] = c)
          }),
          this._unassignEvents(),
          this._assignEvents(),
          this._when(k).then(function() {
            b._trigger("render"),
            b.positioning = E,
            b.hiddenDuringWait || !c.show.ready && !a || b.toggle(D, e.event, E),
            b.hiddenDuringWait = E
          }),
          y.api[this.id] = this,
          this
        }
        ,
        z.destroy = function(a) {
          function b() {
            if (!this.destroyed) {
              this.destroyed = D;
              var a, b = this.target, c = b.attr(ca);
              this.rendered && this.tooltip.stop(1, 0).find("*").remove().end().remove(),
              d.each(this.plugins, function() {
                this.destroy && this.destroy()
              });
              for (a in this.timers)
                this.timers.hasOwnProperty(a) && clearTimeout(this.timers[a]);
              b.removeData(S).removeAttr(U).removeAttr(T).removeAttr("aria-describedby"),
              this.options.suppress && c && b.attr("title", c).removeAttr(ca),
              this._unassignEvents(),
              this.options = this.elements = this.cache = this.timers = this.plugins = this.mouse = F,
              delete y.api[this.id]
            }
          }
          return this.destroyed ? this.target : (a === D && "hide" !== this.triggering || !this.rendered ? b.call(this) : (this.tooltip.one("tooltiphidden", d.proxy(b, this)),
          !this.triggering && this.hide()),
          this.target)
        }
        ,
        B = z.checks = {
          builtin: {
            "^id$": function(a, b, c, e) {
              var f = c === D ? y.nextid : c
                , g = S + "-" + f;
              f !== E && f.length > 0 && !d("#" + g).length ? (this._id = g,
              this.rendered && (this.tooltip[0].id = this._id,
              this.elements.content[0].id = this._id + "-content",
              this.elements.title[0].id = this._id + "-title")) : a[b] = e
            },
            "^prerender": function(a, b, c) {
              c && !this.rendered && this.render(this.options.show.ready)
            },
            "^content.text$": function(a, b, c) {
              this._updateContent(c)
            },
            "^content.attr$": function(a, b, c, d) {
              this.options.content.text === this.target.attr(d) && this._updateContent(this.target.attr(c))
            },
            "^content.title$": function(a, b, c) {
              return c ? (c && !this.elements.title && this._createTitle(),
              void this._updateTitle(c)) : this._removeTitle()
            },
            "^content.button$": function(a, b, c) {
              this._updateButton(c)
            },
            "^content.title.(text|button)$": function(a, b, c) {
              this.set("content." + b, c)
            },
            "^position.(my|at)$": function(a, b, c) {
              "string" == typeof c && (this.position[b] = a[b] = new A(c,"at" === b))
            },
            "^position.container$": function(a, b, c) {
              this.rendered && this.tooltip.appendTo(c)
            },
            "^show.ready$": function(a, b, c) {
              c && (!this.rendered && this.render(D) || this.toggle(D))
            },
            "^style.classes$": function(a, b, c, d) {
              this.rendered && this.tooltip.removeClass(d).addClass(c)
            },
            "^style.(width|height)": function(a, b, c) {
              this.rendered && this.tooltip.css(b, c)
            },
            "^style.widget|content.title": function() {
              this.rendered && this._setWidget()
            },
            "^style.def": function(a, b, c) {
              this.rendered && this.tooltip.toggleClass(Z, !!c)
            },
            "^events.(render|show|move|hide|focus|blur)$": function(a, b, c) {
              this.rendered && this.tooltip[(d.isFunction(c) ? "" : "un") + "bind"]("tooltip" + b, c)
            },
            "^(show|hide|position).(event|target|fixed|inactive|leave|distance|viewport|adjust)": function() {
              if (this.rendered) {
                var a = this.options.position;
                this.tooltip.attr("tracking", "mouse" === a.target && a.adjust.mouse),
                this._unassignEvents(),
                this._assignEvents()
              }
            }
          }
        },
        z.get = function(a) {
          if (this.destroyed)
            return this;
          var b = i(this.options, a.toLowerCase())
            , c = b[0][b[1]];
          return c.precedance ? c.string() : c
        }
        ;
        var ea = /^position\.(my|at|adjust|target|container|viewport)|style|content|show\.ready/i
          , fa = /^prerender|show\.ready/i;
        z.set = function(a, b) {
          if (this.destroyed)
            return this;
          var c, e = this.rendered, f = E, g = this.options;
          return "string" == typeof a ? (c = a,
          a = {},
          a[c] = b) : a = d.extend({}, a),
          d.each(a, function(b, c) {
            if (e && fa.test(b))
              return void delete a[b];
            var h, j = i(g, b.toLowerCase());
            h = j[0][j[1]],
            j[0][j[1]] = c && c.nodeType ? d(c) : c,
            f = ea.test(b) || f,
            a[b] = [j[0], j[1], c, h]
          }),
          h(g),
          this.positioning = D,
          d.each(a, d.proxy(j, this)),
          this.positioning = E,
          this.rendered && this.tooltip[0].offsetWidth > 0 && f && this.reposition("mouse" === g.position.target ? F : this.cache.event),
          this
        }
        ,
        z._update = function(a, b) {
          var c = this
            , e = this.cache;
          return this.rendered && a ? (d.isFunction(a) && (a = a.call(this.elements.target, e.event, this) || ""),
          d.isFunction(a.then) ? (e.waiting = D,
          a.then(function(a) {
            return e.waiting = E,
            c._update(a, b)
          }, F, function(a) {
            return c._update(a, b)
          })) : a === E || !a && "" !== a ? E : (a.jquery && a.length > 0 ? b.empty().append(a.css({
            display: "block",
            visibility: "visible"
          })) : b.html(a),
          this._waitForContent(b).then(function(a) {
            c.rendered && c.tooltip[0].offsetWidth > 0 && c.reposition(e.event, !a.length)
          }))) : E
        }
        ,
        z._waitForContent = function(a) {
          var b = this.cache;
          return b.waiting = D,
          (d.fn.imagesLoaded ? a.imagesLoaded() : (new d.Deferred).resolve([])).done(function() {
            b.waiting = E
          }).promise()
        }
        ,
        z._updateContent = function(a, b) {
          this._update(a, this.elements.content, b)
        }
        ,
        z._updateTitle = function(a, b) {
          this._update(a, this.elements.title, b) === E && this._removeTitle(E)
        }
        ,
        z._createTitle = function() {
          var a = this.elements
            , b = this._id + "-title";
          a.titlebar && this._removeTitle(),
          a.titlebar = d("<div />", {
            class: S + "-titlebar " + (this.options.style.widget ? k("header") : "")
          }).append(a.title = d("<div />", {
            id: b,
            class: S + "-title",
            "aria-atomic": D
          })).insertBefore(a.content).delegate(".qtip-close", "mousedown keydown mouseup keyup mouseout", function(a) {
            d(this).toggleClass("ui-state-active ui-state-focus", "down" === a.type.substr(-4))
          }).delegate(".qtip-close", "mouseover mouseout", function(a) {
            d(this).toggleClass("ui-state-hover", "mouseover" === a.type)
          }),
          this.options.content.button && this._createButton()
        }
        ,
        z._removeTitle = function(a) {
          var b = this.elements;
          b.title && (b.titlebar.remove(),
          b.titlebar = b.title = b.button = F,
          a !== E && this.reposition())
        }
        ,
        z._createPosClass = function(a) {
          return S + "-pos-" + (a || this.options.position.my).abbrev()
        }
        ,
        z.reposition = function(c, e) {
          if (!this.rendered || this.positioning || this.destroyed)
            return this;
          this.positioning = D;
          var f, g, h, i, j = this.cache, k = this.tooltip, l = this.options.position, m = l.target, n = l.my, o = l.at, p = l.viewport, q = l.container, r = l.adjust, s = r.method.split(" "), t = k.outerWidth(E), u = k.outerHeight(E), v = 0, w = 0, x = k.css("position"), y = {
            left: 0,
            top: 0
          }, z = k[0].offsetWidth > 0, A = c && "scroll" === c.type, B = d(a), C = q[0].ownerDocument, F = this.mouse;
          if (d.isArray(m) && 2 === m.length)
            o = {
              x: L,
              y: K
            },
            y = {
              left: m[0],
              top: m[1]
            };
          else if ("mouse" === m)
            o = {
              x: L,
              y: K
            },
            (!r.mouse || this.options.hide.distance) && j.origin && j.origin.pageX ? c = j.origin : !c || c && ("resize" === c.type || "scroll" === c.type) ? c = j.event : F && F.pageX && (c = F),
            "static" !== x && (y = q.offset()),
            C.body.offsetWidth !== (a.innerWidth || C.documentElement.clientWidth) && (g = d(b.body).offset()),
            y = {
              left: c.pageX - y.left + (g && g.left || 0),
              top: c.pageY - y.top + (g && g.top || 0)
            },
            r.mouse && A && F && (y.left -= (F.scrollX || 0) - B.scrollLeft(),
            y.top -= (F.scrollY || 0) - B.scrollTop());
          else {
            if ("event" === m ? c && c.target && "scroll" !== c.type && "resize" !== c.type ? j.target = d(c.target) : c.target || (j.target = this.elements.target) : "event" !== m && (j.target = d(m.jquery ? m : this.elements.target)),
            m = j.target,
            m = d(m).eq(0),
            0 === m.length)
              return this;
            m[0] === b || m[0] === a ? (v = da.iOS ? a.innerWidth : m.width(),
            w = da.iOS ? a.innerHeight : m.height(),
            m[0] === a && (y = {
              top: (p || m).scrollTop(),
              left: (p || m).scrollLeft()
            })) : R.imagemap && m.is("area") ? f = R.imagemap(this, m, o, R.viewport ? s : E) : R.svg && m && m[0].ownerSVGElement ? f = R.svg(this, m, o, R.viewport ? s : E) : (v = m.outerWidth(E),
            w = m.outerHeight(E),
            y = m.offset()),
            f && (v = f.width,
            w = f.height,
            g = f.offset,
            y = f.position),
            y = this.reposition.offset(m, y, q),
            (da.iOS > 3.1 && da.iOS < 4.1 || da.iOS >= 4.3 && da.iOS < 4.33 || !da.iOS && "fixed" === x) && (y.left -= B.scrollLeft(),
            y.top -= B.scrollTop()),
            (!f || f && f.adjustable !== E) && (y.left += o.x === N ? v : o.x === O ? v / 2 : 0,
            y.top += o.y === M ? w : o.y === O ? w / 2 : 0)
          }
          return y.left += r.x + (n.x === N ? -t : n.x === O ? -t / 2 : 0),
          y.top += r.y + (n.y === M ? -u : n.y === O ? -u / 2 : 0),
          R.viewport ? (h = y.adjusted = R.viewport(this, y, l, v, w, t, u),
          g && h.left && (y.left += g.left),
          g && h.top && (y.top += g.top),
          h.my && (this.position.my = h.my)) : y.adjusted = {
            left: 0,
            top: 0
          },
          j.posClass !== (i = this._createPosClass(this.position.my)) && (j.posClass = i,
          k.removeClass(j.posClass).addClass(i)),
          this._trigger("move", [y, p.elem || p], c) ? (delete y.adjusted,
          e === E || !z || isNaN(y.left) || isNaN(y.top) || "mouse" === m || !d.isFunction(l.effect) ? k.css(y) : d.isFunction(l.effect) && (l.effect.call(k, this, d.extend({}, y)),
          k.queue(function(a) {
            d(this).css({
              opacity: "",
              height: ""
            }),
            da.ie && this.style.removeAttribute("filter"),
            a()
          })),
          this.positioning = E,
          this) : this
        }
        ,
        z.reposition.offset = function(a, c, e) {
          function f(a, b) {
            c.left += b * a.scrollLeft(),
            c.top += b * a.scrollTop()
          }
          if (!e[0])
            return c;
          var g, h, i, j, k = d(a[0].ownerDocument), l = !!da.ie && "CSS1Compat" !== b.compatMode, m = e[0];
          do
            "static" !== (h = d.css(m, "position")) && ("fixed" === h ? (i = m.getBoundingClientRect(),
            f(k, -1)) : (i = d(m).position(),
            i.left += parseFloat(d.css(m, "borderLeftWidth")) || 0,
            i.top += parseFloat(d.css(m, "borderTopWidth")) || 0),
            c.left -= i.left + (parseFloat(d.css(m, "marginLeft")) || 0),
            c.top -= i.top + (parseFloat(d.css(m, "marginTop")) || 0),
            g || "hidden" === (j = d.css(m, "overflow")) || "visible" === j || (g = d(m)));
          while (m = m.offsetParent);return g && (g[0] !== k[0] || l) && f(g, 1),
          c
        }
        ;
        var ga = (A = z.reposition.Corner = function(a, b) {
          a = ("" + a).replace(/([A-Z])/, " $1").replace(/middle/gi, O).toLowerCase(),
          this.x = (a.match(/left|right/i) || a.match(/center/) || ["inherit"])[0].toLowerCase(),
          this.y = (a.match(/top|bottom|center/i) || ["inherit"])[0].toLowerCase(),
          this.forceY = !!b;
          var c = a.charAt(0);
          this.precedance = "t" === c || "b" === c ? H : G
        }
        ).prototype;
        ga.invert = function(a, b) {
          this[a] = this[a] === L ? N : this[a] === N ? L : b || this[a]
        }
        ,
        ga.string = function(a) {
          var b = this.x
            , c = this.y
            , d = b !== c ? "center" === b || "center" !== c && (this.precedance === H || this.forceY) ? [c, b] : [b, c] : [b];
          return a !== !1 ? d.join(" ") : d
        }
        ,
        ga.abbrev = function() {
          var a = this.string(!1);
          return a[0].charAt(0) + (a[1] && a[1].charAt(0) || "")
        }
        ,
        ga.clone = function() {
          return new A(this.string(),this.forceY)
        }
        ,
        z.toggle = function(a, c) {
          var e = this.cache
            , f = this.options
            , g = this.tooltip;
          if (c) {
            if (/over|enter/.test(c.type) && e.event && /out|leave/.test(e.event.type) && f.show.target.add(c.target).length === f.show.target.length && g.has(c.relatedTarget).length)
              return this;
            e.event = d.event.fix(c)
          }
          if (this.waiting && !a && (this.hiddenDuringWait = D),
          !this.rendered)
            return a ? this.render(1) : this;
          if (this.destroyed || this.disabled)
            return this;
          var h, i, j, k = a ? "show" : "hide", l = this.options[k], m = this.options.position, n = this.options.content, o = this.tooltip.css("width"), p = this.tooltip.is(":visible"), q = a || 1 === l.target.length, r = !c || l.target.length < 2 || e.target[0] === c.target;
          return (typeof a).search("boolean|number") && (a = !p),
          h = !g.is(":animated") && p === a && r,
          i = h ? F : !!this._trigger(k, [90]),
          this.destroyed ? this : (i !== E && a && this.focus(c),
          !i || h ? this : (d.attr(g[0], "aria-hidden", !a),
          a ? (this.mouse && (e.origin = d.event.fix(this.mouse)),
          d.isFunction(n.text) && this._updateContent(n.text, E),
          d.isFunction(n.title) && this._updateTitle(n.title, E),
          !C && "mouse" === m.target && m.adjust.mouse && (d(b).bind("mousemove." + S, this._storeMouse),
          C = D),
          o || g.css("width", g.outerWidth(E)),
          this.reposition(c, arguments[2]),
          o || g.css("width", ""),
          l.solo && ("string" == typeof l.solo ? d(l.solo) : d(W, l.solo)).not(g).not(l.target).qtip("hide", new d.Event("tooltipsolo"))) : (clearTimeout(this.timers.show),
          delete e.origin,
          C && !d(W + '[tracking="true"]:visible', l.solo).not(g).length && (d(b).unbind("mousemove." + S),
          C = E),
          this.blur(c)),
          j = d.proxy(function() {
            a ? (da.ie && g[0].style.removeAttribute("filter"),
            g.css("overflow", ""),
            "string" == typeof l.autofocus && d(this.options.show.autofocus, g).focus(),
            this.options.show.target.trigger("qtip-" + this.id + "-inactive")) : g.css({
              display: "",
              visibility: "",
              opacity: "",
              left: "",
              top: ""
            }),
            this._trigger(a ? "visible" : "hidden")
          }, this),
          l.effect === E || q === E ? (g[k](),
          j()) : d.isFunction(l.effect) ? (g.stop(1, 1),
          l.effect.call(g, this),
          g.queue("fx", function(a) {
            j(),
            a()
          })) : g.fadeTo(90, a ? 1 : 0, j),
          a && l.target.trigger("qtip-" + this.id + "-inactive"),
          this))
        }
        ,
        z.show = function(a) {
          return this.toggle(D, a)
        }
        ,
        z.hide = function(a) {
          return this.toggle(E, a)
        }
        ,
        z.focus = function(a) {
          if (!this.rendered || this.destroyed)
            return this;
          var b = d(W)
            , c = this.tooltip
            , e = parseInt(c[0].style.zIndex, 10)
            , f = y.zindex + b.length;
          return c.hasClass($) || this._trigger("focus", [f], a) && (e !== f && (b.each(function() {
            this.style.zIndex > e && (this.style.zIndex = this.style.zIndex - 1)
          }),
          b.filter("." + $).qtip("blur", a)),
          c.addClass($)[0].style.zIndex = f),
          this
        }
        ,
        z.blur = function(a) {
          return !this.rendered || this.destroyed ? this : (this.tooltip.removeClass($),
          this._trigger("blur", [this.tooltip.css("zIndex")], a),
          this)
        }
        ,
        z.disable = function(a) {
          return this.destroyed ? this : ("toggle" === a ? a = !(this.rendered ? this.tooltip.hasClass(aa) : this.disabled) : "boolean" != typeof a && (a = D),
          this.rendered && this.tooltip.toggleClass(aa, a).attr("aria-disabled", a),
          this.disabled = !!a,
          this)
        }
        ,
        z.enable = function() {
          return this.disable(E)
        }
        ,
        z._createButton = function() {
          var a = this
            , b = this.elements
            , c = b.tooltip
            , e = this.options.content.button
            , f = "string" == typeof e
            , g = f ? e : "Close tooltip";
          b.button && b.button.remove(),
          e.jquery ? b.button = e : b.button = d("<a />", {
            class: "qtip-close " + (this.options.style.widget ? "" : S + "-icon"),
            title: g,
            "aria-label": g
          }).prepend(d("<span />", {
            class: "ui-icon ui-icon-close",
            html: "&times;"
          })),
          b.button.appendTo(b.titlebar || c).attr("role", "button").click(function(b) {
            return c.hasClass(aa) || a.hide(b),
            E
          })
        }
        ,
        z._updateButton = function(a) {
          if (!this.rendered)
            return E;
          var b = this.elements.button;
          a ? this._createButton() : b.remove()
        }
        ,
        z._setWidget = function() {
          var a = this.options.style.widget
            , b = this.elements
            , c = b.tooltip
            , d = c.hasClass(aa);
          c.removeClass(aa),
          aa = a ? "ui-state-disabled" : "qtip-disabled",
          c.toggleClass(aa, d),
          c.toggleClass("ui-helper-reset " + k(), a).toggleClass(Z, this.options.style.def && !a),
          b.content && b.content.toggleClass(k("content"), a),
          b.titlebar && b.titlebar.toggleClass(k("header"), a),
          b.button && b.button.toggleClass(S + "-icon", !a)
        }
        ,
        z._storeMouse = function(a) {
          return (this.mouse = d.event.fix(a)).type = "mousemove",
          this
        }
        ,
        z._bind = function(a, b, c, e, f) {
          if (a && c && b.length) {
            var g = "." + this._id + (e ? "-" + e : "");
            return d(a).bind((b.split ? b : b.join(g + " ")) + g, d.proxy(c, f || this)),
            this
          }
        }
        ,
        z._unbind = function(a, b) {
          return a && d(a).unbind("." + this._id + (b ? "-" + b : "")),
          this
        }
        ,
        z._trigger = function(a, b, c) {
          var e = new d.Event("tooltip" + a);
          return e.originalEvent = c && d.extend({}, c) || this.cache.event || F,
          this.triggering = a,
          this.tooltip.trigger(e, [this].concat(b || [])),
          this.triggering = E,
          !e.isDefaultPrevented()
        }
        ,
        z._bindEvents = function(a, b, c, e, f, g) {
          var h = c.filter(e).add(e.filter(c))
            , i = [];
          h.length && (d.each(b, function(b, c) {
            var e = d.inArray(c, a);
            e > -1 && i.push(a.splice(e, 1)[0])
          }),
          i.length && (this._bind(h, i, function(a) {
            var b = this.rendered ? this.tooltip[0].offsetWidth > 0 : !1;
            (b ? g : f).call(this, a)
          }),
          c = c.not(h),
          e = e.not(h))),
          this._bind(c, a, f),
          this._bind(e, b, g)
        }
        ,
        z._assignInitialEvents = function(a) {
          function b(a) {
            return this.disabled || this.destroyed ? E : (this.cache.event = a && d.event.fix(a),
            this.cache.target = a && d(a.target),
            clearTimeout(this.timers.show),
            void (this.timers.show = l.call(this, function() {
              this.render("object" == typeof a || c.show.ready)
            }, c.prerender ? 0 : c.show.delay)))
          }
          var c = this.options
            , e = c.show.target
            , f = c.hide.target
            , g = c.show.event ? d.trim("" + c.show.event).split(" ") : []
            , h = c.hide.event ? d.trim("" + c.hide.event).split(" ") : [];
          this._bind(this.elements.target, ["remove", "removeqtip"], function() {
            this.destroy(!0)
          }, "destroy"),
          /mouse(over|enter)/i.test(c.show.event) && !/mouse(out|leave)/i.test(c.hide.event) && h.push("mouseleave"),
          this._bind(e, "mousemove", function(a) {
            this._storeMouse(a),
            this.cache.onTarget = D
          }),
          this._bindEvents(g, h, e, f, b, function() {
            return this.timers ? void clearTimeout(this.timers.show) : E
          }),
          (c.show.ready || c.prerender) && b.call(this, a)
        }
        ,
        z._assignEvents = function() {
          var c = this
            , e = this.options
            , f = e.position
            , g = this.tooltip
            , h = e.show.target
            , i = e.hide.target
            , j = f.container
            , k = f.viewport
            , l = d(b)
            , q = d(a)
            , r = e.show.event ? d.trim("" + e.show.event).split(" ") : []
            , s = e.hide.event ? d.trim("" + e.hide.event).split(" ") : [];
          d.each(e.events, function(a, b) {
            c._bind(g, "toggle" === a ? ["tooltipshow", "tooltiphide"] : ["tooltip" + a], b, null, g)
          }),
          /mouse(out|leave)/i.test(e.hide.event) && "window" === e.hide.leave && this._bind(l, ["mouseout", "blur"], function(a) {
            /select|option/.test(a.target.nodeName) || a.relatedTarget || this.hide(a)
          }),
          e.hide.fixed ? i = i.add(g.addClass(Y)) : /mouse(over|enter)/i.test(e.show.event) && this._bind(i, "mouseleave", function() {
            clearTimeout(this.timers.show)
          }),
          ("" + e.hide.event).indexOf("unfocus") > -1 && this._bind(j.closest("html"), ["mousedown", "touchstart"], function(a) {
            var b = d(a.target)
              , c = this.rendered && !this.tooltip.hasClass(aa) && this.tooltip[0].offsetWidth > 0
              , e = b.parents(W).filter(this.tooltip[0]).length > 0;
            b[0] === this.target[0] || b[0] === this.tooltip[0] || e || this.target.has(b[0]).length || !c || this.hide(a)
          }),
          "number" == typeof e.hide.inactive && (this._bind(h, "qtip-" + this.id + "-inactive", o, "inactive"),
          this._bind(i.add(g), y.inactiveEvents, o)),
          this._bindEvents(r, s, h, i, m, n),
          this._bind(h.add(g), "mousemove", function(a) {
            if ("number" == typeof e.hide.distance) {
              var b = this.cache.origin || {}
                , c = this.options.hide.distance
                , d = Math.abs;
              (d(a.pageX - b.pageX) >= c || d(a.pageY - b.pageY) >= c) && this.hide(a)
            }
            this._storeMouse(a)
          }),
          "mouse" === f.target && f.adjust.mouse && (e.hide.event && this._bind(h, ["mouseenter", "mouseleave"], function(a) {
            return this.cache ? void (this.cache.onTarget = "mouseenter" === a.type) : E
          }),
          this._bind(l, "mousemove", function(a) {
            this.rendered && this.cache.onTarget && !this.tooltip.hasClass(aa) && this.tooltip[0].offsetWidth > 0 && this.reposition(a)
          })),
          (f.adjust.resize || k.length) && this._bind(d.event.special.resize ? k : q, "resize", p),
          f.adjust.scroll && this._bind(q.add(f.container), "scroll", p)
        }
        ,
        z._unassignEvents = function() {
          var c = this.options
            , e = c.show.target
            , f = c.hide.target
            , g = d.grep([this.elements.target[0], this.rendered && this.tooltip[0], c.position.container[0], c.position.viewport[0], c.position.container.closest("html")[0], a, b], function(a) {
            return "object" == typeof a
          });
          e && e.toArray && (g = g.concat(e.toArray())),
          f && f.toArray && (g = g.concat(f.toArray())),
          this._unbind(g)._unbind(g, "destroy")._unbind(g, "inactive")
        }
        ,
        d(function() {
          q(W, ["mouseenter", "mouseleave"], function(a) {
            var b = "mouseenter" === a.type
              , c = d(a.currentTarget)
              , e = d(a.relatedTarget || a.target)
              , f = this.options;
            b ? (this.focus(a),
            c.hasClass(Y) && !c.hasClass(aa) && clearTimeout(this.timers.hide)) : "mouse" === f.position.target && f.position.adjust.mouse && f.hide.event && f.show.target && !e.closest(f.show.target[0]).length && this.hide(a),
            c.toggleClass(_, b)
          }),
          q("[" + U + "]", X, o)
        }),
        y = d.fn.qtip = function(a, b, e) {
          var f = ("" + a).toLowerCase()
            , g = F
            , i = d.makeArray(arguments).slice(1)
            , j = i[i.length - 1]
            , k = this[0] ? d.data(this[0], S) : F;
          return !arguments.length && k || "api" === f ? k : "string" == typeof a ? (this.each(function() {
            var a = d.data(this, S);
            if (!a)
              return D;
            if (j && j.timeStamp && (a.cache.event = j),
            !b || "option" !== f && "options" !== f)
              a[f] && a[f].apply(a, i);
            else {
              if (e === c && !d.isPlainObject(b))
                return g = a.get(b),
                E;
              a.set(b, e)
            }
          }),
          g !== F ? g : this) : "object" != typeof a && arguments.length ? void 0 : (k = h(d.extend(D, {}, a)),
          this.each(function(a) {
            var b, c;
            return c = d.isArray(k.id) ? k.id[a] : k.id,
            c = !c || c === E || c.length < 1 || y.api[c] ? y.nextid++ : c,
            b = r(d(this), c, k),
            b === E ? D : (y.api[c] = b,
            d.each(R, function() {
              "initialize" === this.initialize && this(b)
            }),
            void b._assignInitialEvents(j))
          }))
        }
        ,
        d.qtip = e,
        y.api = {},
        d.each({
          attr: function(a, b) {
            if (this.length) {
              var c = this[0]
                , e = "title"
                , f = d.data(c, "qtip");
              if (a === e && f && f.options && "object" == typeof f && "object" == typeof f.options && f.options.suppress)
                return arguments.length < 2 ? d.attr(c, ca) : (f && f.options.content.attr === e && f.cache.attr && f.set("content.text", b),
                this.attr(ca, b))
            }
            return d.fn["attr" + ba].apply(this, arguments)
          },
          clone: function(a) {
            var b = d.fn["clone" + ba].apply(this, arguments);
            return a || b.filter("[" + ca + "]").attr("title", function() {
              return d.attr(this, ca)
            }).removeAttr(ca),
            b
          }
        }, function(a, b) {
          if (!b || d.fn[a + ba])
            return D;
          var c = d.fn[a + ba] = d.fn[a];
          d.fn[a] = function() {
            return b.apply(this, arguments) || c.apply(this, arguments)
          }
        }),
        d.ui || (d["cleanData" + ba] = d.cleanData,
        d.cleanData = function(a) {
          for (var b, c = 0; (b = d(a[c])).length; c++)
            if (b.attr(T))
              try {
                b.triggerHandler("removeqtip")
              } catch (e) {}
          d["cleanData" + ba].apply(this, arguments)
        }
        ),
        y.version = "3.0.3",
        y.nextid = 0,
        y.inactiveEvents = X,
        y.zindex = 15e3,
        y.defaults = {
          prerender: E,
          id: E,
          overwrite: D,
          suppress: D,
          content: {
            text: D,
            attr: "title",
            title: E,
            button: E
          },
          position: {
            my: "top left",
            at: "bottom right",
            target: E,
            container: E,
            viewport: E,
            adjust: {
              x: 0,
              y: 0,
              mouse: D,
              scroll: D,
              resize: D,
              method: "flipinvert flipinvert"
            },
            effect: function(a, b) {
              d(this).animate(b, {
                duration: 200,
                queue: E
              })
            }
          },
          show: {
            target: E,
            event: "mouseenter",
            effect: D,
            delay: 90,
            solo: E,
            ready: E,
            autofocus: E
          },
          hide: {
            target: E,
            event: "mouseleave",
            effect: D,
            delay: 0,
            fixed: E,
            inactive: E,
            leave: "window",
            distance: E
          },
          style: {
            classes: "",
            widget: E,
            width: E,
            height: E,
            def: D
          },
          events: {
            render: F,
            move: F,
            show: F,
            hide: F,
            toggle: F,
            visible: F,
            hidden: F,
            focus: F,
            blur: F
          }
        };
        var ha, ia, ja, ka, la, ma = "margin", na = "border", oa = "color", pa = "background-color", qa = "transparent", ra = " !important", sa = !!b.createElement("canvas").getContext, ta = /rgba?\(0, 0, 0(, 0)?\)|transparent|#123456/i, ua = {}, va = ["Webkit", "O", "Moz", "ms"];
        sa ? (ka = a.devicePixelRatio || 1,
        la = function() {
          var a = b.createElement("canvas").getContext("2d");
          return a.backingStorePixelRatio || a.webkitBackingStorePixelRatio || a.mozBackingStorePixelRatio || a.msBackingStorePixelRatio || a.oBackingStorePixelRatio || 1
        }(),
        ja = ka / la) : ia = function(a, b, c) {
          return "<qtipvml:" + a + ' xmlns="urn:schemas-microsoft.com:vml" class="qtip-vml" ' + (b || "") + ' style="behavior: url(#default#VML); ' + (c || "") + '" />'
        }
        ,
        d.extend(v.prototype, {
          init: function(a) {
            var b, c;
            c = this.element = a.elements.tip = d("<div />", {
              class: S + "-tip"
            }).prependTo(a.tooltip),
            sa ? (b = d("<canvas />").appendTo(this.element)[0].getContext("2d"),
            b.lineJoin = "miter",
            b.miterLimit = 1e5,
            b.save()) : (b = ia("shape", 'coordorigin="0,0"', "position:absolute;"),
            this.element.html(b + b),
            a._bind(d("*", c).add(c), ["click", "mousedown"], function(a) {
              a.stopPropagation()
            }, this._ns)),
            a._bind(a.tooltip, "tooltipmove", this.reposition, this._ns, this),
            this.create()
          },
          _swapDimensions: function() {
            this.size[0] = this.options.height,
            this.size[1] = this.options.width
          },
          _resetDimensions: function() {
            this.size[0] = this.options.width,
            this.size[1] = this.options.height
          },
          _useTitle: function(a) {
            var b = this.qtip.elements.titlebar;
            return b && (a.y === K || a.y === O && this.element.position().top + this.size[1] / 2 + this.options.offset < b.outerHeight(D))
          },
          _parseCorner: function(a) {
            var b = this.qtip.options.position.my;
            return a === E || b === E ? a = E : a === D ? a = new A(b.string()) : a.string || (a = new A(a),
            a.fixed = D),
            a
          },
          _parseWidth: function(a, b, c) {
            var d = this.qtip.elements
              , e = na + s(b) + "Width";
            return (c ? u(c, e) : u(d.content, e) || u(this._useTitle(a) && d.titlebar || d.content, e) || u(d.tooltip, e)) || 0
          },
          _parseRadius: function(a) {
            var b = this.qtip.elements
              , c = na + s(a.y) + s(a.x) + "Radius";
            return da.ie < 9 ? 0 : u(this._useTitle(a) && b.titlebar || b.content, c) || u(b.tooltip, c) || 0
          },
          _invalidColour: function(a, b, c) {
            var d = a.css(b);
            return !d || c && d === a.css(c) || ta.test(d) ? E : d
          },
          _parseColours: function(a) {
            var b = this.qtip.elements
              , c = this.element.css("cssText", "")
              , e = na + s(a[a.precedance]) + s(oa)
              , f = this._useTitle(a) && b.titlebar || b.content
              , g = this._invalidColour
              , h = [];
            return h[0] = g(c, pa) || g(f, pa) || g(b.content, pa) || g(b.tooltip, pa) || c.css(pa),
            h[1] = g(c, e, oa) || g(f, e, oa) || g(b.content, e, oa) || g(b.tooltip, e, oa) || b.tooltip.css(e),
            d("*", c).add(c).css("cssText", pa + ":" + qa + ra + ";" + na + ":0" + ra + ";"),
            h
          },
          _calculateSize: function(a) {
            var b, c, d, e = a.precedance === H, f = this.options.width, g = this.options.height, h = "c" === a.abbrev(), i = (e ? f : g) * (h ? .5 : 1), j = Math.pow, k = Math.round, l = Math.sqrt(j(i, 2) + j(g, 2)), m = [this.border / i * l, this.border / g * l];
            return m[2] = Math.sqrt(j(m[0], 2) - j(this.border, 2)),
            m[3] = Math.sqrt(j(m[1], 2) - j(this.border, 2)),
            b = l + m[2] + m[3] + (h ? 0 : m[0]),
            c = b / l,
            d = [k(c * f), k(c * g)],
            e ? d : d.reverse()
          },
          _calculateTip: function(a, b, c) {
            c = c || 1,
            b = b || this.size;
            var d = b[0] * c
              , e = b[1] * c
              , f = Math.ceil(d / 2)
              , g = Math.ceil(e / 2)
              , h = {
              br: [0, 0, d, e, d, 0],
              bl: [0, 0, d, 0, 0, e],
              tr: [0, e, d, 0, d, e],
              tl: [0, 0, 0, e, d, e],
              tc: [0, e, f, 0, d, e],
              bc: [0, 0, d, 0, f, e],
              rc: [0, 0, d, g, 0, e],
              lc: [d, 0, d, e, 0, g]
            };
            return h.lt = h.br,
            h.rt = h.bl,
            h.lb = h.tr,
            h.rb = h.tl,
            h[a.abbrev()]
          },
          _drawCoords: function(a, b) {
            a.beginPath(),
            a.moveTo(b[0], b[1]),
            a.lineTo(b[2], b[3]),
            a.lineTo(b[4], b[5]),
            a.closePath()
          },
          create: function() {
            var a = this.corner = (sa || da.ie) && this._parseCorner(this.options.corner);
            return this.enabled = !!this.corner && "c" !== this.corner.abbrev(),
            this.enabled && (this.qtip.cache.corner = a.clone(),
            this.update()),
            this.element.toggle(this.enabled),
            this.corner
          },
          update: function(b, c) {
            if (!this.enabled)
              return this;
            var e, f, g, h, i, j, k, l, m = this.qtip.elements, n = this.element, o = n.children(), p = this.options, q = this.size, r = p.mimic, s = Math.round;
            b || (b = this.qtip.cache.corner || this.corner),
            r === E ? r = b : (r = new A(r),
            r.precedance = b.precedance,
            "inherit" === r.x ? r.x = b.x : "inherit" === r.y ? r.y = b.y : r.x === r.y && (r[b.precedance] = b[b.precedance])),
            f = r.precedance,
            b.precedance === G ? this._swapDimensions() : this._resetDimensions(),
            e = this.color = this._parseColours(b),
            e[1] !== qa ? (l = this.border = this._parseWidth(b, b[b.precedance]),
            p.border && 1 > l && !ta.test(e[1]) && (e[0] = e[1]),
            this.border = l = p.border !== D ? p.border : l) : this.border = l = 0,
            k = this.size = this._calculateSize(b),
            n.css({
              width: k[0],
              height: k[1],
              lineHeight: k[1] + "px"
            }),
            j = b.precedance === H ? [s(r.x === L ? l : r.x === N ? k[0] - q[0] - l : (k[0] - q[0]) / 2), s(r.y === K ? k[1] - q[1] : 0)] : [s(r.x === L ? k[0] - q[0] : 0), s(r.y === K ? l : r.y === M ? k[1] - q[1] - l : (k[1] - q[1]) / 2)],
            sa ? (g = o[0].getContext("2d"),
            g.restore(),
            g.save(),
            g.clearRect(0, 0, 6e3, 6e3),
            h = this._calculateTip(r, q, ja),
            i = this._calculateTip(r, this.size, ja),
            o.attr(I, k[0] * ja).attr(J, k[1] * ja),
            o.css(I, k[0]).css(J, k[1]),
            this._drawCoords(g, i),
            g.fillStyle = e[1],
            g.fill(),
            g.translate(j[0] * ja, j[1] * ja),
            this._drawCoords(g, h),
            g.fillStyle = e[0],
            g.fill()) : (h = this._calculateTip(r),
            h = "m" + h[0] + "," + h[1] + " l" + h[2] + "," + h[3] + " " + h[4] + "," + h[5] + " xe",
            j[2] = l && /^(r|b)/i.test(b.string()) ? 8 === da.ie ? 2 : 1 : 0,
            o.css({
              coordsize: k[0] + l + " " + k[1] + l,
              antialias: "" + (r.string().indexOf(O) > -1),
              left: j[0] - j[2] * Number(f === G),
              top: j[1] - j[2] * Number(f === H),
              width: k[0] + l,
              height: k[1] + l
            }).each(function(a) {
              var b = d(this);
              b[b.prop ? "prop" : "attr"]({
                coordsize: k[0] + l + " " + k[1] + l,
                path: h,
                fillcolor: e[0],
                filled: !!a,
                stroked: !a
              }).toggle(!(!l && !a)),
              !a && b.html(ia("stroke", 'weight="' + 2 * l + 'px" color="' + e[1] + '" miterlimit="1000" joinstyle="miter"'))
            })),
            a.opera && setTimeout(function() {
              m.tip.css({
                display: "inline-block",
                visibility: "visible"
              })
            }, 1),
            c !== E && this.calculate(b, k)
          },
          calculate: function(a, b) {
            if (!this.enabled)
              return E;
            var c, e, f = this, g = this.qtip.elements, h = this.element, i = this.options.offset, j = {};
            return a = a || this.corner,
            c = a.precedance,
            b = b || this._calculateSize(a),
            e = [a.x, a.y],
            c === G && e.reverse(),
            d.each(e, function(d, e) {
              var h, k, l;
              e === O ? (h = c === H ? L : K,
              j[h] = "50%",
              j[ma + "-" + h] = -Math.round(b[c === H ? 0 : 1] / 2) + i) : (h = f._parseWidth(a, e, g.tooltip),
              k = f._parseWidth(a, e, g.content),
              l = f._parseRadius(a),
              j[e] = Math.max(-f.border, d ? k : i + (l > h ? l : -h)))
            }),
            j[a[c]] -= b[c === G ? 0 : 1],
            h.css({
              margin: "",
              top: "",
              bottom: "",
              left: "",
              right: ""
            }).css(j),
            j
          },
          reposition: function(a, b, d) {
            function e(a, b, c, d, e) {
              a === Q && j.precedance === b && k[d] && j[c] !== O ? j.precedance = j.precedance === G ? H : G : a !== Q && k[d] && (j[b] = j[b] === O ? k[d] > 0 ? d : e : j[b] === d ? e : d)
            }
            function f(a, b, e) {
              j[a] === O ? p[ma + "-" + b] = o[a] = g[ma + "-" + b] - k[b] : (h = g[e] !== c ? [k[b], -g[b]] : [-k[b], g[b]],
              (o[a] = Math.max(h[0], h[1])) > h[0] && (d[b] -= k[b],
              o[b] = E),
              p[g[e] !== c ? e : b] = o[a])
            }
            if (this.enabled) {
              var g, h, i = b.cache, j = this.corner.clone(), k = d.adjusted, l = b.options.position.adjust.method.split(" "), m = l[0], n = l[1] || l[0], o = {
                left: E,
                top: E,
                x: 0,
                y: 0
              }, p = {};
              this.corner.fixed !== D && (e(m, G, H, L, N),
              e(n, H, G, K, M),
              j.string() === i.corner.string() && i.cornerTop === k.top && i.cornerLeft === k.left || this.update(j, E)),
              g = this.calculate(j),
              g.right !== c && (g.left = -g.right),
              g.bottom !== c && (g.top = -g.bottom),
              g.user = this.offset,
              o.left = m === Q && !!k.left,
              o.left && f(G, L, N),
              o.top = n === Q && !!k.top,
              o.top && f(H, K, M),
              this.element.css(p).toggle(!(o.x && o.y || j.x === O && o.y || j.y === O && o.x)),
              d.left -= g.left.charAt ? g.user : m !== Q || o.top || !o.left && !o.top ? g.left + this.border : 0,
              d.top -= g.top.charAt ? g.user : n !== Q || o.left || !o.left && !o.top ? g.top + this.border : 0,
              i.cornerLeft = k.left,
              i.cornerTop = k.top,
              i.corner = j.clone()
            }
          },
          destroy: function() {
            this.qtip._unbind(this.qtip.tooltip, this._ns),
            this.qtip.elements.tip && this.qtip.elements.tip.find("*").remove().end().remove()
          }
        }),
        ha = R.tip = function(a) {
          return new v(a,a.options.style.tip)
        }
        ,
        ha.initialize = "render",
        ha.sanitize = function(a) {
          if (a.style && "tip"in a.style) {
            var b = a.style.tip;
            "object" != typeof b && (b = a.style.tip = {
              corner: b
            }),
            /string|boolean/i.test(typeof b.corner) || (b.corner = D)
          }
        }
        ,
        B.tip = {
          "^position.my|style.tip.(corner|mimic|border)$": function() {
            this.create(),
            this.qtip.reposition()
          },
          "^style.tip.(height|width)$": function(a) {
            this.size = [a.width, a.height],
            this.update(),
            this.qtip.reposition()
          },
          "^content.title|style.(classes|widget)$": function() {
            this.update()
          }
        },
        d.extend(D, y.defaults, {
          style: {
            tip: {
              corner: D,
              mimic: E,
              width: 6,
              height: 6,
              border: D,
              offset: 0
            }
          }
        });
        var wa, xa, ya = "qtip-modal", za = "." + ya;
        xa = function() {
          function a(a) {
            if (d.expr[":"].focusable)
              return d.expr[":"].focusable;
            var b, c, e, f = !isNaN(d.attr(a, "tabindex")), g = a.nodeName && a.nodeName.toLowerCase();
            return "area" === g ? (b = a.parentNode,
            c = b.name,
            a.href && c && "map" === b.nodeName.toLowerCase() ? (e = d("img[usemap=#" + c + "]")[0],
            !!e && e.is(":visible")) : !1) : /input|select|textarea|button|object/.test(g) ? !a.disabled : "a" === g ? a.href || f : f
          }
          function c(a) {
            j.length < 1 && a.length ? a.not("body").blur() : j.first().focus()
          }
          function e(a) {
            if (h.is(":visible")) {
              var b, e = d(a.target), g = f.tooltip, i = e.closest(W);
              b = i.length < 1 ? E : parseInt(i[0].style.zIndex, 10) > parseInt(g[0].style.zIndex, 10),
              b || e.closest(W)[0] === g[0] || c(e)
            }
          }
          var f, g, h, i = this, j = {};
          d.extend(i, {
            init: function() {
              return h = i.elem = d("<div />", {
                id: "qtip-overlay",
                html: "<div></div>",
                mousedown: function() {
                  return E
                }
              }).hide(),
              d(b.body).bind("focusin" + za, e),
              d(b).bind("keydown" + za, function(a) {
                f && f.options.show.modal.escape && 27 === a.keyCode && f.hide(a)
              }),
              h.bind("click" + za, function(a) {
                f && f.options.show.modal.blur && f.hide(a)
              }),
              i
            },
            update: function(b) {
              f = b,
              j = b.options.show.modal.stealfocus !== E ? b.tooltip.find("*").filter(function() {
                return a(this)
              }) : []
            },
            toggle: function(a, e, j) {
              var k = a.tooltip
                , l = a.options.show.modal
                , m = l.effect
                , n = e ? "show" : "hide"
                , o = h.is(":visible")
                , p = d(za).filter(":visible:not(:animated)").not(k);
              return i.update(a),
              e && l.stealfocus !== E && c(d(":focus")),
              h.toggleClass("blurs", l.blur),
              e && h.appendTo(b.body),
              h.is(":animated") && o === e && g !== E || !e && p.length ? i : (h.stop(D, E),
              d.isFunction(m) ? m.call(h, e) : m === E ? h[n]() : h.fadeTo(parseInt(j, 10) || 90, e ? 1 : 0, function() {
                e || h.hide()
              }),
              e || h.queue(function(a) {
                h.css({
                  left: "",
                  top: ""
                }),
                d(za).length || h.detach(),
                a()
              }),
              g = e,
              f.destroyed && (f = F),
              i)
            }
          }),
          i.init()
        }
        ,
        xa = new xa,
        d.extend(w.prototype, {
          init: function(a) {
            var b = a.tooltip;
            return this.options.on ? (a.elements.overlay = xa.elem,
            b.addClass(ya).css("z-index", y.modal_zindex + d(za).length),
            a._bind(b, ["tooltipshow", "tooltiphide"], function(a, c, e) {
              var f = a.originalEvent;
              if (a.target === b[0])
                if (f && "tooltiphide" === a.type && /mouse(leave|enter)/.test(f.type) && d(f.relatedTarget).closest(xa.elem[0]).length)
                  try {
                    a.preventDefault()
                  } catch (g) {}
                else
                  (!f || f && "tooltipsolo" !== f.type) && this.toggle(a, "tooltipshow" === a.type, e)
            }, this._ns, this),
            a._bind(b, "tooltipfocus", function(a, c) {
              if (!a.isDefaultPrevented() && a.target === b[0]) {
                var e = d(za)
                  , f = y.modal_zindex + e.length
                  , g = parseInt(b[0].style.zIndex, 10);
                xa.elem[0].style.zIndex = f - 1,
                e.each(function() {
                  this.style.zIndex > g && (this.style.zIndex -= 1)
                }),
                e.filter("." + $).qtip("blur", a.originalEvent),
                b.addClass($)[0].style.zIndex = f,
                xa.update(c);
                try {
                  a.preventDefault()
                } catch (h) {}
              }
            }, this._ns, this),
            void a._bind(b, "tooltiphide", function(a) {
              a.target === b[0] && d(za).filter(":visible").not(b).last().qtip("focus", a)
            }, this._ns, this)) : this
          },
          toggle: function(a, b, c) {
            return a && a.isDefaultPrevented() ? this : void xa.toggle(this.qtip, !!b, c)
          },
          destroy: function() {
            this.qtip.tooltip.removeClass(ya),
            this.qtip._unbind(this.qtip.tooltip, this._ns),
            xa.toggle(this.qtip, E),
            delete this.qtip.elements.overlay
          }
        }),
        wa = R.modal = function(a) {
          return new w(a,a.options.show.modal)
        }
        ,
        wa.sanitize = function(a) {
          a.show && ("object" != typeof a.show.modal ? a.show.modal = {
            on: !!a.show.modal
          } : "undefined" == typeof a.show.modal.on && (a.show.modal.on = D))
        }
        ,
        y.modal_zindex = y.zindex - 200,
        wa.initialize = "render",
        B.modal = {
          "^show.modal.(on|blur)$": function() {
            this.destroy(),
            this.init(),
            this.qtip.elems.overlay.toggle(this.qtip.tooltip[0].offsetWidth > 0)
          }
        },
        d.extend(D, y.defaults, {
          show: {
            modal: {
              on: E,
              effect: D,
              blur: D,
              stealfocus: D,
              escape: D
            }
          }
        }),
        R.viewport = function(c, d, e, f, g, h, i) {
          function j(a, b, c, e, f, g, h, i, j) {
            var k = d[f]
              , s = u[a]
              , t = v[a]
              , w = c === Q
              , x = s === f ? j : s === g ? -j : -j / 2
              , y = t === f ? i : t === g ? -i : -i / 2
              , z = q[f] + r[f] - (n ? 0 : m[f])
              , A = z - k
              , B = k + j - (h === I ? o : p) - z
              , C = x - (u.precedance === a || s === u[b] ? y : 0) - (t === O ? i / 2 : 0);
            return w ? (C = (s === f ? 1 : -1) * x,
            d[f] += A > 0 ? A : B > 0 ? -B : 0,
            d[f] = Math.max(-m[f] + r[f], k - C, Math.min(Math.max(-m[f] + r[f] + (h === I ? o : p), k + C), d[f], "center" === s ? k - x : 1e9))) : (e *= c === P ? 2 : 0,
            A > 0 && (s !== f || B > 0) ? (d[f] -= C + e,
            l.invert(a, f)) : B > 0 && (s !== g || A > 0) && (d[f] -= (s === O ? -C : C) + e,
            l.invert(a, g)),
            d[f] < q[f] && -d[f] > B && (d[f] = k,
            l = u.clone())),
            d[f] - k
          }
          var k, l, m, n, o, p, q, r, s = e.target, t = c.elements.tooltip, u = e.my, v = e.at, w = e.adjust, x = w.method.split(" "), y = x[0], z = x[1] || x[0], A = e.viewport, B = e.container, C = {
            left: 0,
            top: 0
          };
          return A.jquery && s[0] !== a && s[0] !== b.body && "none" !== w.method ? (m = B.offset() || C,
          n = "static" === B.css("position"),
          k = "fixed" === t.css("position"),
          o = A[0] === a ? A.width() : A.outerWidth(E),
          p = A[0] === a ? A.height() : A.outerHeight(E),
          q = {
            left: k ? 0 : A.scrollLeft(),
            top: k ? 0 : A.scrollTop()
          },
          r = A.offset() || C,
          "shift" === y && "shift" === z || (l = u.clone()),
          C = {
            left: "none" !== y ? j(G, H, y, w.x, L, N, I, f, h) : 0,
            top: "none" !== z ? j(H, G, z, w.y, K, M, J, g, i) : 0,
            my: l
          }) : C
        }
        ,
        R.polys = {
          polygon: function(a, b) {
            var c, d, e, f = {
              width: 0,
              height: 0,
              position: {
                top: 1e10,
                right: 0,
                bottom: 0,
                left: 1e10
              },
              adjustable: E
            }, g = 0, h = [], i = 1, j = 1, k = 0, l = 0;
            for (g = a.length; g--; )
              c = [parseInt(a[--g], 10), parseInt(a[g + 1], 10)],
              c[0] > f.position.right && (f.position.right = c[0]),
              c[0] < f.position.left && (f.position.left = c[0]),
              c[1] > f.position.bottom && (f.position.bottom = c[1]),
              c[1] < f.position.top && (f.position.top = c[1]),
              h.push(c);
            if (d = f.width = Math.abs(f.position.right - f.position.left),
            e = f.height = Math.abs(f.position.bottom - f.position.top),
            "c" === b.abbrev())
              f.position = {
                left: f.position.left + f.width / 2,
                top: f.position.top + f.height / 2
              };
            else {
              for (; d > 0 && e > 0 && i > 0 && j > 0; )
                for (d = Math.floor(d / 2),
                e = Math.floor(e / 2),
                b.x === L ? i = d : b.x === N ? i = f.width - d : i += Math.floor(d / 2),
                b.y === K ? j = e : b.y === M ? j = f.height - e : j += Math.floor(e / 2),
                g = h.length; g-- && !(h.length < 2); )
                  k = h[g][0] - f.position.left,
                  l = h[g][1] - f.position.top,
                  (b.x === L && k >= i || b.x === N && i >= k || b.x === O && (i > k || k > f.width - i) || b.y === K && l >= j || b.y === M && j >= l || b.y === O && (j > l || l > f.height - j)) && h.splice(g, 1);
              f.position = {
                left: h[0][0],
                top: h[0][1]
              }
            }
            return f
          },
          rect: function(a, b, c, d) {
            return {
              width: Math.abs(c - a),
              height: Math.abs(d - b),
              position: {
                left: Math.min(a, c),
                top: Math.min(b, d)
              }
            }
          },
          _angles: {
            tc: 1.5,
            tr: 7 / 4,
            tl: 5 / 4,
            bc: .5,
            br: .25,
            bl: .75,
            rc: 2,
            lc: 1,
            c: 0
          },
          ellipse: function(a, b, c, d, e) {
            var f = R.polys._angles[e.abbrev()]
              , g = 0 === f ? 0 : c * Math.cos(f * Math.PI)
              , h = d * Math.sin(f * Math.PI);
            return {
              width: 2 * c - Math.abs(g),
              height: 2 * d - Math.abs(h),
              position: {
                left: a + g,
                top: b + h
              },
              adjustable: E
            }
          },
          circle: function(a, b, c, d) {
            return R.polys.ellipse(a, b, c, c, d)
          }
        },
        R.svg = function(a, c, e) {
          for (var f, g, h, i, j, k, l, m, n, o = c[0], p = d(o.ownerSVGElement), q = o.ownerDocument, r = (parseInt(c.css("stroke-width"), 10) || 0) / 2; !o.getBBox; )
            o = o.parentNode;
          if (!o.getBBox || !o.parentNode)
            return E;
          switch (o.nodeName) {
          case "ellipse":
          case "circle":
            m = R.polys.ellipse(o.cx.baseVal.value, o.cy.baseVal.value, (o.rx || o.r).baseVal.value + r, (o.ry || o.r).baseVal.value + r, e);
            break;
          case "line":
          case "polygon":
          case "polyline":
            for (l = o.points || [{
              x: o.x1.baseVal.value,
              y: o.y1.baseVal.value
            }, {
              x: o.x2.baseVal.value,
              y: o.y2.baseVal.value
            }],
            m = [],
            k = -1,
            i = l.numberOfItems || l.length; ++k < i; )
              j = l.getItem ? l.getItem(k) : l[k],
              m.push.apply(m, [j.x, j.y]);
            m = R.polys.polygon(m, e);
            break;
          default:
            m = o.getBBox(),
            m = {
              width: m.width,
              height: m.height,
              position: {
                left: m.x,
                top: m.y
              }
            }
          }
          return n = m.position,
          p = p[0],
          p.createSVGPoint && (g = o.getScreenCTM(),
          l = p.createSVGPoint(),
          l.x = n.left,
          l.y = n.top,
          h = l.matrixTransform(g),
          n.left = h.x,
          n.top = h.y),
          q !== b && "mouse" !== a.position.target && (f = d((q.defaultView || q.parentWindow).frameElement).offset(),
          f && (n.left += f.left,
          n.top += f.top)),
          q = d(q),
          n.left += q.scrollLeft(),
          n.top += q.scrollTop(),
          m
        }
        ,
        R.imagemap = function(a, b, c) {
          b.jquery || (b = d(b));
          var e, f, g, h, i, j = (b.attr("shape") || "rect").toLowerCase().replace("poly", "polygon"), k = d('img[usemap="#' + b.parent("map").attr("name") + '"]'), l = d.trim(b.attr("coords")), m = l.replace(/,$/, "").split(",");
          if (!k.length)
            return E;
          if ("polygon" === j)
            h = R.polys.polygon(m, c);
          else {
            if (!R.polys[j])
              return E;
            for (g = -1,
            i = m.length,
            f = []; ++g < i; )
              f.push(parseInt(m[g], 10));
            h = R.polys[j].apply(this, f.concat(c))
          }
          return e = k.offset(),
          e.left += Math.ceil((k.outerWidth(E) - k.width()) / 2),
          e.top += Math.ceil((k.outerHeight(E) - k.height()) / 2),
          h.position.left += e.left,
          h.position.top += e.top,
          h
        }
        ;
        var Aa, Ba = '<iframe class="qtip-bgiframe" frameborder="0" tabindex="-1" src="javascript:\'\';"  style="display:block; position:absolute; z-index:-1; filter:alpha(opacity=0); -ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";"></iframe>';
        d.extend(x.prototype, {
          _scroll: function() {
            var b = this.qtip.elements.overlay;
            b && (b[0].style.top = d(a).scrollTop() + "px")
          },
          init: function(c) {
            var e = c.tooltip;
            d("select, object").length < 1 && (this.bgiframe = c.elements.bgiframe = d(Ba).appendTo(e),
            c._bind(e, "tooltipmove", this.adjustBGIFrame, this._ns, this)),
            this.redrawContainer = d("<div/>", {
              id: S + "-rcontainer"
            }).appendTo(b.body),
            c.elements.overlay && c.elements.overlay.addClass("qtipmodal-ie6fix") && (c._bind(a, ["scroll", "resize"], this._scroll, this._ns, this),
            c._bind(e, ["tooltipshow"], this._scroll, this._ns, this)),
            this.redraw()
          },
          adjustBGIFrame: function() {
            var a, b, c = this.qtip.tooltip, d = {
              height: c.outerHeight(E),
              width: c.outerWidth(E)
            }, e = this.qtip.plugins.tip, f = this.qtip.elements.tip;
            b = parseInt(c.css("borderLeftWidth"), 10) || 0,
            b = {
              left: -b,
              top: -b
            },
            e && f && (a = "x" === e.corner.precedance ? [I, L] : [J, K],
            b[a[1]] -= f[a[0]]()),
            this.bgiframe.css(b).css(d)
          },
          redraw: function() {
            if (this.qtip.rendered < 1 || this.drawing)
              return this;
            var a, b, c, d, e = this.qtip.tooltip, f = this.qtip.options.style, g = this.qtip.options.position.container;
            return this.qtip.drawing = 1,
            f.height && e.css(J, f.height),
            f.width ? e.css(I, f.width) : (e.css(I, "").appendTo(this.redrawContainer),
            b = e.width(),
            1 > b % 2 && (b += 1),
            c = e.css("maxWidth") || "",
            d = e.css("minWidth") || "",
            a = (c + d).indexOf("%") > -1 ? g.width() / 100 : 0,
            c = (c.indexOf("%") > -1 ? a : 1 * parseInt(c, 10)) || b,
            d = (d.indexOf("%") > -1 ? a : 1 * parseInt(d, 10)) || 0,
            b = c + d ? Math.min(Math.max(b, d), c) : b,
            e.css(I, Math.round(b)).appendTo(g)),
            this.drawing = 0,
            this
          },
          destroy: function() {
            this.bgiframe && this.bgiframe.remove(),
            this.qtip._unbind([a, this.qtip.tooltip], this._ns)
          }
        }),
        Aa = R.ie6 = function(a) {
          return 6 === da.ie ? new x(a) : E
        }
        ,
        Aa.initialize = "render",
        B.ie6 = {
          "^content|style$": function() {
            this.redraw()
          }
        }
      })
    }(window, document);
  };
  var init_qtip_css = function(config) {
    config = config || {
      force: true
    };
    var elem = document.querySelector('style[data-href="qtip.css"]');
    if (elem && !config.force) {
      return
    }
    if (elem && config.force) {
      elem.parentNode.removeChild(elem)
    }
    return function e(t, n, r) {
      function s(o, u) {
        if (!n[o]) {
          if (!t[o]) {
            var a = typeof require === "function" && require;
            if (!u && a) {
              return a(o, !0)
            }
            if (i) {
              return i(o, !0)
            }
            var f = new Error("Cannot find module '" + o + "'");
            throw f.code = "MODULE_NOT_FOUND",
            f
          }
          var l = n[o] = {
            exports: {}
          };
          t[o][0].call(l.exports, function(e) {
            var n = t[o][1][e];
            return s(n ? n : e)
          }, l, l.exports, e, t, n, r)
        }
        return n[o].exports
      }
      var i = typeof require === "function" && require;
      for (var o = 0; o < r.length; o++) {
        s(r[o])
      }
      return s
    }({
      1: [function(require, module, exports) {
        "use strict";
        var styleElementsInsertedAtTop = [];
        var insertStyleElement = function(styleElement, options) {
          var head = document.head || document.getElementsByTagName("head")[0];
          var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
          options = options || {};
          options.insertAt = options.insertAt || "bottom";
          if (options.insertAt === "top") {
            if (!lastStyleElementInsertedAtTop) {
              head.insertBefore(styleElement, head.firstChild)
            } else if (lastStyleElementInsertedAtTop.nextSibling) {
              head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling)
            } else {
              head.appendChild(styleElement)
            }
            styleElementsInsertedAtTop.push(styleElement)
          } else if (options.insertAt === "bottom") {
            head.appendChild(styleElement)
          } else {
            throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.")
          }
        };
        module.exports = {
          createLink: function(href, attributes) {
            var head = document.head || document.getElementsByTagName("head")[0];
            var link = document.createElement("link");
            link.href = href;
            link.rel = "stylesheet";
            for (var key in attributes) {
              if (!attributes.hasOwnProperty(key)) {
                continue
              }
              var value = attributes[key];
              link.setAttribute("data-" + key, value)
            }
            head.appendChild(link)
          },
          createStyle: function(cssText, attributes, extraOptions) {
            extraOptions = extraOptions || {};
            var style = document.createElement("style");
            style.type = "text/css";
            for (var key in attributes) {
              if (!attributes.hasOwnProperty(key)) {
                continue
              }
              var value = attributes[key];
              style.setAttribute("data-" + key, value)
            }
            if (style.sheet) {
              style.innerHTML = cssText;
              style.sheet.cssText = cssText;
              insertStyleElement(style, {
                insertAt: extraOptions.insertAt
              })
            } else if (style.styleSheet) {
              insertStyleElement(style, {
                insertAt: extraOptions.insertAt
              });
              style.styleSheet.cssText = cssText
            } else {
              style.appendChild(document.createTextNode(cssText));
              insertStyleElement(style, {
                insertAt: extraOptions.insertAt
              })
            }
          }
        }
      }
      , {}],
      2: [function(require, module, exports) {
        var css = '#qtip-overlay.blurs,\n.qtip-close {\n  cursor: pointer;\n}\n.qtip {\n  position: absolute;\n  left: -28000px;\n  top: -28000px;\n  display: none;\n  max-width: 500px;\n  min-width: 50px;\n  font-size: 10.5px;\n  line-height: 12px;\n  direction: ltr;\n  box-shadow: none;\n  padding: 0;\n}\n.qtip-content,\n.qtip-titlebar {\n  position: relative;\n  overflow: hidden;\n margin-right: 10px;\n}\n.qtip-content {\n  padding: 5px 9px;\n  text-align: left;\n  word-wrap: break-word;\n}\n.qtip-titlebar {\n  padding: 5px 35px 5px 10px;\n  border-width: 0 0 1px;\n  font-weight: 700;\n}\n.qtip-titlebar+.qtip-content {\n  border-top-width: 0!important;\n}\n.qtip-close {\n  position: absolute;\n  right: -9px;\n  top: -9px;\n  z-index: 11;\n  outline: 0;\n  border: 1px solid transparent;\n}\n.qtip-titlebar .qtip-close {\n  right: 4px;\n  top: 50%;\n  margin-top: -9px;\n}\n* html .qtip-titlebar .qtip-close {\n  top: 16px;\n}\n.qtip-icon .ui-icon,\n.qtip-titlebar .ui-icon {\n  display: block;\n  text-indent: -1000em;\n  direction: ltr;\n}\n.qtip-icon,\n.qtip-icon .ui-icon {\n  -moz-border-radius: 3px;\n  -webkit-border-radius: 3px;\n  border-radius: 3px;\n  text-decoration: none;\n}\n.qtip-icon .ui-icon {\n  width: 18px;\n  height: 14px;\n  line-height: 14px;\n  text-align: center;\n  text-indent: 0;\n  font: normal 700 10px/13px Tahoma,sans-serif;\n  color: inherit;\n  background: -100em -100em no-repeat;\n}\n.qtip-default {\n  border: 1px solid #F1D031;\n  background-color: #FFFFA3;\n  color: #555;\n}\n.qtip-default .qtip-titlebar {\n  background-color: #FFEF93;\n}\n.qtip-default .qtip-icon {\n  border-color: #CCC;\n  background: #F1F1F1;\n  color: #777;\n}\n.qtip-default .qtip-titlebar .qtip-close {\n  border-color: #AAA;\n  color: #111;\n}\n.qtip-light {\n  background-color: #fff;\n  border-color: #E2E2E2;\n  color: #454545;\n}\n.qtip-light .qtip-titlebar {\n  background-color: #f1f1f1;\n}\n.qtip-dark {\n  background-color: #505050;\n  border-color: #303030;\n  color: #f3f3f3;\n}\n.qtip-dark .qtip-titlebar {\n  background-color: #404040;\n}\n.qtip-dark .qtip-icon {\n  border-color: #444;\n}\n.qtip-dark .qtip-titlebar .ui-state-hover {\n  border-color: #303030;\n}\n.qtip-cream {\n  background-color: #FBF7AA;\n  border-color: #F9E98E;\n  color: #A27D35;\n}\n.qtip-red,\n.qtip-red .qtip-icon,\n.qtip-red .qtip-titlebar .ui-state-hover {\n  border-color: #D95252;\n}\n.qtip-cream .qtip-titlebar {\n  background-color: #F0DE7D;\n}\n.qtip-cream .qtip-close .qtip-icon {\n  background-position: -82px 0;\n}\n.qtip-red {\n  background-color: #F78B83;\n  color: #912323;\n}\n.qtip-red .qtip-titlebar {\n  background-color: #F06D65;\n}\n.qtip-red .qtip-close .qtip-icon {\n  background-position: -102px 0;\n}\n.qtip-green {\n  background-color: #CAED9E;\n  border-color: #90D93F;\n  color: #3F6219;\n}\n.qtip-green .qtip-titlebar {\n  background-color: #B0DE78;\n}\n.qtip-green .qtip-close .qtip-icon {\n  background-position: -42px 0;\n}\n.qtip-blue {\n  background-color: #E5F6FE;\n  border-color: #ADD9ED;\n  color: #5E99BD;\n}\n.qtip-blue .qtip-titlebar {\n  background-color: #D0E9F5;\n}\n.qtip-blue .qtip-close .qtip-icon {\n  background-position: -2px 0;\n}\n.qtip-shadow {\n  -webkit-box-shadow: 1px 1px 3px 1px rgba(0,0,0,.15);\n  -moz-box-shadow: 1px 1px 3px 1px rgba(0,0,0,.15);\n  box-shadow: 1px 1px 3px 1px rgba(0,0,0,.15);\n}\n.qtip-bootstrap,\n.qtip-rounded,\n.qtip-tipsy {\n  -moz-border-radius: 5px;\n  -webkit-border-radius: 5px;\n  border-radius: 5px;\n}\n.qtip-rounded .qtip-titlebar {\n  -moz-border-radius: 4px 4px 0 0;\n  -webkit-border-radius: 4px 4px 0 0;\n  border-radius: 4px 4px 0 0;\n}\n.qtip-youtube {\n  -moz-border-radius: 2px;\n  -webkit-border-radius: 2px;\n  border-radius: 2px;\n  -webkit-box-shadow: 0 0 3px #333;\n  -moz-box-shadow: 0 0 3px #333;\n  box-shadow: 0 0 3px #333;\n  color: #fff;\n  border: 0 solid transparent;\n  background: #4A4A4A;\n  background-image: -webkit-gradient(linear,left top,left bottom,color-stop(0,#4A4A4A),color-stop(100%,#000));\n  background-image: -webkit-linear-gradient(top,#4A4A4A 0,#000 100%);\n  background-image: -moz-linear-gradient(top,#4A4A4A 0,#000 100%);\n  background-image: -ms-linear-gradient(top,#4A4A4A 0,#000 100%);\n  background-image: -o-linear-gradient(top,#4A4A4A 0,#000 100%);\n}\n.qtip-youtube .qtip-titlebar {\n  background-color: #4A4A4A;\n  background-color: rgba(0,0,0,0);\n}\n.qtip-youtube .qtip-content {\n  padding: .75em;\n  font: 12px arial,sans-serif;\n  filter: progid:DXImageTransform.Microsoft.Gradient(GradientType=0, StartColorStr=#4a4a4a, EndColorStr=#000000);\n  -ms-filter: "progid:DXImageTransform.Microsoft.Gradient(GradientType=0,StartColorStr=#4a4a4a,EndColorStr=#000000);";\n}\n.qtip-youtube .qtip-icon {\n  border-color: #222;\n}\n.qtip-youtube .qtip-titlebar .ui-state-hover {\n  border-color: #303030;\n}\n.qtip-jtools {\n  background: #232323;\n  background: rgba(0,0,0,.7);\n  background-image: -webkit-gradient(linear,left top,left bottom,from(#717171),to(#232323));\n  background-image: -moz-linear-gradient(top,#717171,#232323);\n  background-image: -webkit-linear-gradient(top,#717171,#232323);\n  background-image: -ms-linear-gradient(top,#717171,#232323);\n  background-image: -o-linear-gradient(top,#717171,#232323);\n  border: 2px solid #ddd;\n  border: 2px solid rgba(241,241,241,1);\n  -moz-border-radius: 2px;\n  -webkit-border-radius: 2px;\n  border-radius: 2px;\n  -webkit-box-shadow: 0 0 12px #333;\n  -moz-box-shadow: 0 0 12px #333;\n  box-shadow: 0 0 12px #333;\n}\n.qtip-jtools .qtip-titlebar {\n  background-color: transparent;\n  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=#717171, endColorstr=#4A4A4A);\n  -ms-filter: "progid:DXImageTransform.Microsoft.gradient(startColorstr=#717171,endColorstr=#4A4A4A)";\n}\n.qtip-jtools .qtip-content {\n  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=#4A4A4A, endColorstr=#232323);\n  -ms-filter: "progid:DXImageTransform.Microsoft.gradient(startColorstr=#4A4A4A,endColorstr=#232323)";\n}\n.qtip-jtools .qtip-content,\n.qtip-jtools .qtip-titlebar {\n  background: 0 0;\n  color: #fff;\n  border: 0 dashed transparent;\n}\n.qtip-jtools .qtip-icon {\n  border-color: #555;\n}\n.qtip-jtools .qtip-titlebar .ui-state-hover {\n  border-color: #333;\n}\n.qtip-cluetip {\n  -webkit-box-shadow: 4px 4px 5px rgba(0,0,0,.4);\n  -moz-box-shadow: 4px 4px 5px rgba(0,0,0,.4);\n  box-shadow: 4px 4px 5px rgba(0,0,0,.4);\n  background-color: #D9D9C2;\n  color: #111;\n  border: 0 dashed transparent;\n}\n.qtip-cluetip .qtip-titlebar {\n  background-color: #87876A;\n  color: #fff;\n  border: 0 dashed transparent;\n}\n.qtip-cluetip .qtip-icon {\n  border-color: #808064;\n}\n.qtip-cluetip .qtip-titlebar .ui-state-hover {\n  border-color: #696952;\n  color: #696952;\n}\n.qtip-tipsy {\n  background: #000;\n  background: rgba(0,0,0,.87);\n  color: #fff;\n  border: 0 solid transparent;\n  font-size: 11px;\n  font-family: \'Lucida Grande\',sans-serif;\n  font-weight: 700;\n  line-height: 16px;\n  text-shadow: 0 1px #000;\n}\n.qtip-tipsy .qtip-titlebar {\n  padding: 6px 35px 0 10px;\n  background-color: transparent;\n}\n.qtip-tipsy .qtip-content {\n  padding: 6px 10px;\n}\n.qtip-tipsy .qtip-icon {\n  border-color: #222;\n  text-shadow: none;\n}\n.qtip-tipsy .qtip-titlebar .ui-state-hover {\n  border-color: #303030;\n}\n.qtip-tipped {\n  border: 3px solid #959FA9;\n  -moz-border-radius: 3px;\n  -webkit-border-radius: 3px;\n  border-radius: 3px;\n  background-color: #F9F9F9;\n  color: #454545;\n  font-weight: 400;\n  font-family: serif;\n}\n.qtip-tipped .qtip-titlebar {\n  border-bottom-width: 0;\n  color: #fff;\n  background: #3A79B8;\n  background-image: -webkit-gradient(linear,left top,left bottom,from(#3A79B8),to(#2E629D));\n  background-image: -webkit-linear-gradient(top,#3A79B8,#2E629D);\n  background-image: -moz-linear-gradient(top,#3A79B8,#2E629D);\n  background-image: -ms-linear-gradient(top,#3A79B8,#2E629D);\n  background-image: -o-linear-gradient(top,#3A79B8,#2E629D);\n  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=#3A79B8, endColorstr=#2E629D);\n  -ms-filter: "progid:DXImageTransform.Microsoft.gradient(startColorstr=#3A79B8,endColorstr=#2E629D)";\n}\n.qtip-tipped .qtip-icon {\n  border: 2px solid #285589;\n  background: #285589;\n}\n.qtip-tipped .qtip-icon .ui-icon {\n  background-color: #FBFBFB;\n  color: #555;\n}\n.qtip-bootstrap {\n  font-size: 14px;\n  line-height: 20px;\n  color: #333;\n  padding: 1px;\n  background-color: #fff;\n  border: 1px solid #ccc;\n  border: 1px solid rgba(0,0,0,.2);\n  -webkit-border-radius: 6px;\n  -moz-border-radius: 6px;\n  border-radius: 6px;\n  -webkit-box-shadow: 0 5px 10px rgba(0,0,0,.2);\n  -moz-box-shadow: 0 5px 10px rgba(0,0,0,.2);\n  box-shadow: 0 5px 10px rgba(0,0,0,.2);\n  -webkit-background-clip: padding-box;\n  -moz-background-clip: padding;\n  background-clip: padding-box;\n}\n.qtip-bootstrap .qtip-titlebar {\n  padding: 8px 14px;\n  margin: 0;\n  font-size: 14px;\n  font-weight: 400;\n  line-height: 18px;\n  background-color: #f7f7f7;\n  border-bottom: 1px solid #ebebeb;\n  -webkit-border-radius: 5px 5px 0 0;\n  -moz-border-radius: 5px 5px 0 0;\n  border-radius: 5px 5px 0 0;\n}\n.qtip-bootstrap .qtip-titlebar .qtip-close {\n  right: 11px;\n  top: 45%;\n  border-style: none;\n}\n.qtip-bootstrap .qtip-content {\n  padding: 9px 14px;\n}\n.qtip-bootstrap .qtip-icon {\n  background: 0 0;\n}\n.qtip-bootstrap .qtip-icon .ui-icon {\n  width: auto;\n  height: auto;\n  float: right;\n  font-size: 20px;\n  font-weight: 700;\n  line-height: 18px;\n  color: #000;\n  text-shadow: 0 1px 0 #fff;\n  opacity: .2;\n  filter: alpha(opacity=20);\n}\n#qtip-overlay,\n#qtip-overlay div {\n  left: 0;\n  top: 0;\n  width: 100%;\n  height: 100%;\n}\n.qtip-bootstrap .qtip-icon .ui-icon:hover {\n  color: #000;\n  text-decoration: none;\n  cursor: pointer;\n  opacity: .4;\n  filter: alpha(opacity=40);\n}\n.qtip:not(.ie9haxors) div.qtip-content,\n.qtip:not(.ie9haxors) div.qtip-titlebar {\n  filter: none;\n  -ms-filter: none;\n}\n.qtip .qtip-tip {\n  margin: 0 auto;\n  overflow: hidden;\n  z-index: 10;\n}\n.qtip .qtip-tip,\nx:-o-prefocus {\n  visibility: hidden;\n}\n.qtip .qtip-tip,\n.qtip .qtip-tip .qtip-vml,\n.qtip .qtip-tip canvas {\n  position: absolute;\n  color: #123456;\n  background: 0 0;\n  border: 0 dashed transparent;\n}\n.qtip .qtip-tip canvas {\n  top: 0;\n  left: 0;\n}\n.qtip .qtip-tip .qtip-vml {\n  behavior: url(#default#VML);\n  display: inline-block;\n  visibility: visible;\n}\n#qtip-overlay {\n  position: fixed;\n}\n#qtip-overlay div {\n  position: absolute;\n  background-color: #000;\n  opacity: .7;\n  filter: alpha(opacity=70);\n  -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=70)";\n}\n.qtipmodal-ie6fix {\n  position: absolute!important;\n}\n';
        require("browserify-css").createStyle(css, {
          href: "qtip.css"
        }, {
          insertAt: "bottom"
        });
        module.exports = css
      }
      , {
        "browserify-css": 1
      }]
    }, {}, [2])
  };
  var init_qtip_css_mod = function(config) {
    config = config || {
      force: true
    };
    if (config.force) {
      let elem = document.querySelector("#qtip-mod");
      if (elem) {
        elem.parentNode.removeChild(elem)
      }
    }
    var stylesheet = document.createElement("style");
    stylesheet.type = "text/css";
    stylesheet.id = "qtip-mod";
    document.head.appendChild(stylesheet);
    stylesheet.sheet.addRule(".qtip-mono", "font-family: Consolas for BBEdit !important;");
    stylesheet.sheet.addRule(".qtip-title", "margin-right: 20px;");
    stylesheet.sheet.addRule("ul.tip", "padding-left: 0px !important; list-style-type:none;");
    stylesheet.sheet.addRule("p.tip-header", "padding-left: 0px !important; height: 20px; display: inline-block; margin: 1px; font-weight: bolder; font-size: 12px")
  };
  function parseHTML(str) {
    var tmp = document.implementation.createHTMLDocument();
    tmp.body.innerHTML = str;
    return tmp.body.children[0]
  }
  var init_qtip_config = function(config) {
    var qtip_config = {
      content: {
        button: true,
        text: function(event, api) {
          var text;
          var elem = $(this).find(".lr").get(0);
          if(elem) text = text.textContent;
          text = text.split(",").map(function(str) {
            var obj = {};
            obj.id = utui.data.loadrules[str.trim()].id;
            obj.text = obj.id + ":" + utui.data.loadrules[str.trim()].title;
            return obj
          });
          var ul = document.createElement("ul");
          ul.classList.add("tip");

          function build_template(data) {
            var li_text = ['<li style="font-size: 11px;"><i class="icon-book mapping-icon" data-id=' + data.id + "></i>" + " " + data.text + "</li>"].join("");
            var li = parseHTML(li_text);
            li.dataset.id = data.id;
            li.firstElementChild.onclick = function() {
              utui.util.pubsub.publish(utui.constants.loadrules.FOCUSED, "loadrules_content", "loadrules", this.dataset.id, ".uidValue")
            }
            ;
            return li
          }
          text.forEach(function(obj) {
            li = build_template(obj);
            ul.appendChild(li)
          });
          return ul
        },
        title: function(event, api) {
          var id = this[0].parentNode.parentNode.parentNode.dataset.id;
          var title = id + ": " + utui.data.manage[id].title;
          return "<p class='tip-header'>" + title + "</p>"
        }
      },
      style: {
        classes: "qtip-bootstrap qtip-shadow qtip-mono"
      },
      events: {
        visible: function(event, api) {
//           api.set("hide.target", $(event.originalEvent.target).closest(".manage_container").get(0));
//           api.set("hide.event", "mouseleave");
          var enter = function(event) {
            var api = this;
            console.log(["enter", event, api]);
            if (!api.debounced_enter) {
              api.debounced_enter = 1
            }
            var otime = event.timeStamp;
            api.set("hide.distance", false);
            api.set("hide.target", api.tooltip);
            api.set("hide.event", false);
            if (window.qtip_debug) {
              console.count(api.id + ":enter")
            }
            var leave = function(event) {
              var api = this;
              api.toggle(false);
              api.set("hide.distance", 40);
              if (window.qtip_debug) {
                console.count(api.id + ":leave")
              }
              api.debounced_leave = 1
            }
            .bind(api);
            var debounced_leave = lodash.debounce(leave, 200, {
              leading: true,
              trailing: false
            });
            if (!api.debounced_leave) {
              $(api.tooltip).on("mouseleave", debounced_leave)
            }
          }
          .bind(api);
          var debounced_enter = lodash.debounce(enter, 200, {
            leading: true,
            trailing: false
          });
          if (!api.debounced_enter) {
            $(api.tooltip).on("mouseenter", debounced_enter);
            if (window.qtip_debug) {
              console.log(api.id + ":adding")
            }
          }
        }
      },
      hide: {
        event: false,
        inactive: false,
        fixed: true,
        delay: 0
      },
      show: {
        event: "mouseenter",
        effect: true,
        delay: 0,
        solo: true
      },
      position: {
        my: "center left",
        at: "top right",
        adjust: {
          x: 0,
          y: 10,
          method: "flip"
        }
      }
    };
    if (config.debug) {
      qtip_config.hide.event = false
    }
    return $("div.container_info").qtip(qtip_config)
  };
  function init(options) {
    init_qtip_js();
    init_qtip_css(options);
    init_qtip_css_mod(options);
    init_qtip_config(options);
  }
  return init;
})();
qtip_init({
  force: true,
  debug: false
});
