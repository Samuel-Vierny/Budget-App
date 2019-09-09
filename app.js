//BUDGET CONTROLLER:
var budgetController = (function () {

  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1
  };

    Expense.prototype.calcPercentage = function(totalIncome) {

      if (totalIncome > 0) {
        this.percentage = Math.round((this.value / totalIncome) * 100);
      } else {
        this.percentage = -1;
      }
    };

    Expense.prototype.getPercentage = function() {
      return this.percentage;
    };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;   
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(cur) {
      sum = sum + cur.value; //(sum += cur.value)
    })
    data.totals[type] = sum
  };

  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0, 
    percentage: -1 
  }

  return {
    //all public methods
      addItem: function(type, des, val) {
        var newItem, ID;

       //create new ID
       if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1; 
       } else {
         ID = 0;
       }

       //Create new item based on 'inc' or 'exp' type
        if (type === 'exp') {
          newItem = new Expense(ID, des, val);
        } else if (type === 'inc') {
          newItem = new Income(ID, des, val);
        }

        //push it into our data structure 
        data.allItems[type].push(newItem);

        //Return the new element
        return newItem;

      },

      deleteItem: function(type, id) {
        var ids, index;

        ids = data.allItems[type].map(function(current) {

          return current.id;

        });

        index = ids.indexOf(id); 

        if (index !== -1) { 
          data.allItems[type].splice(index, 1); 
        }
      },

      calculateBudget: function() {

        //calculate total income and expenses
        calculateTotal('exp');
        calculateTotal('inc');

        //calculate the budget: income - expenses
        data.budget = data.totals.inc - data.totals.exp;

        //calculate the percentage of income spent
        if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
        } else {
          data.percentage = -1;
        }
      },


      calculatePercentages: function() {
        
        //To calculate percentage of expense: expense/income

        data.allItems.exp.forEach(function(cur) {
          cur.calcPercentage(data.totals.inc);
        });

      },

      getPercentages: function() {
        var allPerc = data.allItems.exp.map(function(cur) {
          return cur.getPercentage();
        });
        return allPerc;
      },

      getBudget: function() {
        return {
          budget: data.budget,
          totalInc: data.totals.inc,
          totalExp: data.totals.exp,
          percentage: data.percentage,
        };
      },

      testing: function() {
        console.log(data);
      }
  } 

})();

//UI Controller
var UIController = (function() {

  var DOMstrings = { //This is like the html parts saved in one area 
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };


  var formatNumber = function(num, type) {
    var numSplit, int, dec, type;
    /*
    + or - before the number
    exactly 2 decimal points
    comma separating the thousands

    2310.4567 -> + 2,310.46
    2000 -> 2,000.00
    */

    num = Math.abs(num); //to make it an absolute number, this is a math.method
    num = num.toFixed(2); //this is a method of the number prototype, to make it have 2 decimal places regardless.

    numSplit = num.split('.')

    int = numSplit[0]; //int for integer
    if(int.length > 3) {
     // int = int.substr(0, 1) + ',' + int.substr(1, 3) //input 2310, output 2,310, but 23576 would be 2,3576 which is wrong, we need to make this sentence more dynamic.
     int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);

      
      //this Method returns a part of a string that we want. the first place is for where you start, and the second is how many you read.
    }


    dec = numSplit[1];

    // type === 'exp' ? sign = '-' : sign = '+'; //let's put this directly in the return

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec; //the part in brackets will be executed first.

  };

  var nodeListForEach = function(list, callback) { //this is for looping not an array but through nodes in html.

    for (var i = 0; i < list.length; i++) {
      callback(list[i], i); //this here is the current and the index, i.e. percentage[i], percentage.
    }

  }; //This node function was moved here so that we can access it from the global scope. to turn the fields red for exp.

  //Public method or function as we need access to it from the controller.
  return {
    getInput: function() {
    return {
      
      type: document.querySelector(DOMstrings.inputType).value, //will be inc or exp
      description: document.querySelector(DOMstrings.inputDescription).value,
      value: parseFloat(document.querySelector(DOMstrings.inputValue).value) 
    };
    },

    addListItem: function(obj, type) {

      var html, newHtml, element;
      //Create HTML string with placeholder text
      if (type === 'inc') {
        element = DOMstrings.incomeContainer;

        html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
      }
      else if (type === 'exp') {
        element = DOMstrings.expensesContainer;

        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      //Replace placeholder text with actual data
      newHtml = html.replace('%id%', obj.id); 
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      //Insert HTML intto the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },
      
    deleteListItem: function(selectorID) {
      var el = document.getElementById(selectorID)

      el.parentNode.removeChild(el); 
      
    },



    //this is to clear the entries from the boxes.
    clearFields: function() {//this is to clear the entries from the boxes.
      var fields, fieldsArr;
      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue); 

   fieldsArr = Array.prototype.slice.call(fields); 
  
   fieldsArr.forEach(function(current, index, array) { 
    current.value = ""; 
   });

   fieldsArr[0].focus(); 

    }, 

    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---'
      }

    },

    displayPercentages: function(percentages) {

      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

    //Nodelistforeach was here but was moved up to be accessible to the global app controller

      nodeListForEach(fields, function(current, index) {

        if (percentages[index] > 0) {
        current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---'; 
        }
      });
    },

    displayMonth: function() {
      var now, year, months, month;
      var now = new Date(); //just leaving this blank will return today's date.
      //var Christmas = new Date(2016, 11, 25);
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      month = now.getMonth();

      year = now.getFullYear();
      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
    },


    changedType: function() {

      var fields = document.querySelectorAll(
        DOMstrings.inputType + ',' +
        DOMstrings.inputDescription + ',' +
        DOMstrings.inputValue); //this is a node list, and so we cannot use the forEach method. but we can use the nodelistforeach method we made before.

        nodeListForEach(fields, function(cur) {
          cur.classList.toggle('red-focus'); //we don't want to use add or remove here, but toggle, otherwise it would stay there if we used add.
        }); //we don't need index class as all we want is to add the red class to the elements

        document.querySelector(DOMstrings.inputBtn).classList.toggle('red')
    },

    getDOMstrings: function() {
      return DOMstrings;
    }
  }

})();



//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

  var setupEventListeners = function() {  
    var DOM = UICtrl.getDOMstrings(); 

    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
    document.addEventListener('keypress', function(event) {
      if (event.keyCode === 13 || event.which === 13) { 
        ctrlAddItem();
      };
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
 
    //So that when we change from an inc to an exp the boxes turn red instead of blue
    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

  };


  var updateBudget = function() {

    //4. Calculate the budget.
    budgetCtrl.calculateBudget();
    //5. return budget
    var budget = budgetCtrl.getBudget();
    //6. Display the budget on the UI
    UICtrl.displayBudget(budget) 
  };

  var updatePercentages = function() { //similar to calculate budget function

    //1. calculate percentages 
    budgetCtrl.calculatePercentages();
    //2. Read percentages from budgetCtrl
    var percentages = budgetCtrl.getPercentages();
    //3. update UI with new percentages
    UICtrl.displayPercentages(percentages);
  };


  var ctrlAddItem = function() {
    var input, newItem
    //1. get field input data
    input = UICtrl.getInput();

    if (input.description !== '' && !isNaN(input.value) && input.value > 0) { 

      //2. add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
    
      //3. add new item to UI
      UICtrl.addListItem(newItem, input.type);
  
      //4. Clear the fields
      UICtrl.clearFields();
  
      //5. Calculate and update budget
      updateBudget();
  
      //6. Calculate and update percentages
      updatePercentages();

    }
    };  

    //To delete an item
    var ctrlDeleteItem = function(event) {
      var itemID, splitID, type, ID;

      //DOM traversing
      itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

      if (itemID) { //this will happen only if item ID exists, and is not undefined.

        //format is like inc-1 or exp-2

        splitID = itemID.split('-'); 
        type = splitID[0];
        ID = parseInt(splitID[1]); 

        //1. delete item from the data structure
        budgetCtrl.deleteItem(type, ID);
        //2. delete item from user interace
        UICtrl.deleteListItem(itemID);
        //3. update and show new budget
        updateBudget();
        //4. Calculate and update percentages
      updatePercentages();
      }
    };


  //init function
  return {
    init: function() {
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: 0,
      }) 
      setupEventListeners();
    }
  };

})(budgetController, UIController);

controller.init();