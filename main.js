var blogy =  angular.module('BlogyApp', ['ngSanitize'])

class actionButton {
  constructor(func, param, className, element) {
    this.element = $('<button class="' + classname + '"></button>');
    this.element.on("click", function () {
        func(...param);
    });
  }
}
class actionButtonUpload {
    constructor(func, param) {
        this.element = $('<label class="addimg"><input type="file" name="files[]"  accept=".jpg, .png, .gif"/></label>');
        this.element.on("change", function () {
            func(...param, this);
        });
    }
}
class actionMenu {
    constructor(classname) {
        this.menu = $('<div class="' + classname + '"></div>');
        this.elementArray = new Array();
        this.activator = "";
    }
    addElement(el) {
        this.elementArray.push(el);
        this.menu.append(el.element);
    }
}
class blogElement {
  constructor({id = undefined, newClass = "", properties = {}, html = "", editor = false} = {}){
    this.id = id;
    this.html = html;
    this.properties = properties;
    this.editor = editor
    this.class = newClass;
  }
}


blogy.config(function ($interpolateProvider) {
    $interpolateProvider.startSymbol('{[{');
    $interpolateProvider.endSymbol('}]}');
});

blogy.filter("trust", ['$sce', function ($sce) {
    return function (htmlCode) {
        return $sce.trustAsHtml(htmlCode);
    }
}]);

blogy.directive('contenteditable', ['$sce', function ($sce) {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function () {
                element.html($sce.getTrustedHtml(ngModel.$viewValue || ''));
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function () {
                scope.$evalAsync(read);
            });
            read(); // initialize

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
}]);

blogy.controller('BlogyEditorController', ['$scope',
  function($scope) {
    html = `<div><p>NEW TEXT</p></div>`
    htmla = `<div><p>TEST</p></div>`
    htmlImg = `<img ng-src="{[{x.properties.src}]}">`
    $scope.elementArray = []
    currentElement = undefined;
    fileInput = document.getElementById("file_input")

    $scope.addElement = ({blogElement = {}, el = undefined} = {}) => {
      var index = $scope.elementArray.indexOf(el) + 1;
      $scope.elementArray.splice(index, 0, blogElement)
    }

    $scope.addTextField = (el) => {
      $scope.addElement({blogElement : new blogElement({
                                      id:1,
                                      html: html,
                                      editor : true,
                                      newClass : "text_field"
                                    }),
                          el:el})
    }

    $scope.addImgField = (el) => {
      $scope.addElement({blogElement : new blogElement({
                                      id:1,
                                      html: htmlImg,
                                      editor : true,
                                      newClass : "img_field"
                                    }),
                          el:el})
    }

    $scope.test = (el) => {
      currentElement = el;
      fileInput.onchange = (e) => {
        if (fileInput.files && fileInput.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                //console.log(e.target.result)
                $scope.addElement({blogElement : new blogElement({
                                                id:1,
                                                html: `<img src="`+ e.target.result+`">`,
                                                editor : true,
                                                newClass : "img_field",
                                                properties: {src: e.target.result}
                                              }),
                                    el:currentElement})
                $scope.$apply();
            };
            reader.readAsDataURL(fileInput.files[0]);
            el.value = "";
        }
      }
      fileInput.click()
    }

    $scope.moveUp = (el) => {
      var temp = el;
      var old_index = $scope.elementArray.indexOf(el);
      $scope.elementArray[old_index] = $scope.elementArray[old_index - 1];
      $scope.elementArray[old_index - 1] = el;
    }

    $scope.moveDown = (el) => {
        var old_index = $scope.elementArray.indexOf(el);
        console.log(old_index);
        $scope.elementArray[old_index] = $scope.elementArray[old_index + 1];
        $scope.elementArray[old_index + 1] = el;
    }
  }
]);
