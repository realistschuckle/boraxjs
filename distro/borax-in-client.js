var borax = {}; (function(borax) {
borax.withAjax = function() {return borax;};
borax.start = function() {};})(borax);
if(typeof(exports) !== "undefined") {
  exports["borax-in-client"] = borax;
} else {
  exports = {"borax-in-client": borax};
}