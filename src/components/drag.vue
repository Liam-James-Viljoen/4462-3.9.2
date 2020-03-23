<template>
  <div class="row">
    <!-- Insert drag here -->
    <div class="activity-wrapper">
      <div class="left-wrapper"  v-if="answersRevealed == false">
        <div role="list" class="col sticky">
          <draggable
            aria-live="polite"
            class="list-group staging-list-group"
            v-bind="dragOptions"
            :list="listOfListsStaged"
            :disabled="dragDisabled"
          >
            <li
              v-for="(element, index) in listOfListsStaged"
              :key="index"
              role="listitem"
              class="list-group-item"
              :id="'item_' + element.order"
              tabindex="0"
              @focus="SetSelectedLineStaging(index)"
              @keyup.up="moveUpStaging"
              @keyup.down="moveDownStaging"
              @keyup.right="moveRightStaging"
            >
              {{ element.text }}
            </li>
          </draggable>
        </div>
      </div>
      <div class="right-wrapper">
        <div
          role="list"
          class="col"
          v-for="(listHeading, listIndex) in listHeadings"
          :key="listIndex"
        >
          <h3>{{ listHeading.title }}</h3>
          <h4>{{ "Number of answers: " + lengthOfSections[listIndex] }}</h4>
          <draggable
            aria-live="polite"
            class="list-group"
            v-bind="dragOptions"
            :list="listOfLists[listIndex]"
            :disabled="dragDisabled"
          >
            <li
              role="listitem"
              class="list-group-item"
              v-for="(element, innerIndex) in listOfLists[listIndex]"
              :key="innerIndex"
              :id="'item_' + element.order"
              tabindex="0"
              @focus="SetSelectedLine(listIndex, innerIndex)"
              @keyup.up="moveUp"
              @keyup.down="moveDown"
              @keyup.left="moveLeft"
            >
              {{ element.text }}
              <i v-if="element.correct == true">✔️ (Correct)</i>
              <i v-if="element.incorrect == true">❌ (Incorrect)</i>
            </li>
          </draggable>
        </div>
      </div>
    </div>
    <div class="btn-wrapper">
      <button
        id="submitbtn"
        @click="submitAnswers()"
        v-if="submit == false && attempts > 0"
      >
        Submit answers
      </button>
      <button id="retrybtn" @click="retryQuestion()" v-if="submit == true">
        Retry
      </button>
      <button
        id="revealbtn"
        @click="revealAnswers()"
        v-if="attempts <= 0 && answersRevealed == false"
      >
        Reveal answers
      </button>
      <div id="attempts" v-if="answersRevealed == false">
        <h4>{{ "Attempts Left: " + attempts }}</h4>
      </div>
    </div>
  </div>
</template>
<script>
import draggable from "vuedraggable";

export default {
  name: "DragInteractive",
  components: {
    draggable
  },
  data() {
    return {
      attempts: 3,
      dragDisabled: false,
      submit: false,
      answersRevealed: false,
      selectedLine: null,
      selectedLineStaging: null,
      currentItem: null,
      currentList: null,
      lengthOfSections: [],
      listOfLists: [],
      listOfListsStaged: [],
      listHeadings: [],
      listOfCorrectAnswers: []
    };
  },
  mounted() {
    this.setupLists();
    for (let i = 0; i < this.lengthOfSections.length; i++) {
      this.listOfLists.push([]);
    }
    var exampleAnswers = this.listOfListsStaged.filter(function(el) {
      return el.example == true;
    });
    this.listOfListsStaged = this.listOfListsStaged.filter(function(el) {
      return el.example == false;
    });
    for (let i = 0; i < exampleAnswers.length; i++) {
      this.listOfCorrectAnswers.push(exampleAnswers[i]);
      this.listOfLists[exampleAnswers[i].group].push(exampleAnswers[i]);
    }
    this.listHeadings = this.titles;
  },
  updated: function() {
    //Stops error on update caused by mounted function
    if (this.currentItem !== null) {
      document.getElementById("item_" + this.currentItem.order).focus(); //Keeps focus on moved item
    }
  },
  computed: {
    dragOptions() {
      return {
        animation: 200,
        group: "description",
        disabled: false,
        ghostClass: "ghost"
      };
    },
    titles: {
      get() {
        return this.$store.state.data.titles;
      }
    },
    list: {
      get() {
        return this.$store.state.data.lists;
      },
      set(val) {
        //This shouldn't be called but shows how you would update the store
        this.$store.dispatch("setList", val);
      }
    }
  },
  methods: {
    setupLists: function() {
      //Deconstruct List
      var completeListOfStatements = this.refineMappedArray(this.list);

      //Jumble list
      var refinedArrayDisordered = this.disorderedArrayMethod(
        completeListOfStatements
      );

      this.listOfListsStaged = [...refinedArrayDisordered];
    },
    moveUp: function() {
      if (this.selectedLine === 0) {
        //console.log("already at top?");
        if (this.currentList === 0) {
          //console.log("Top of the Top(pops)");
        } else {
          if (this.listOfLists[this.currentList - 1].length === 0) {
            //console.log("The above list doesn't have anything in it");
            this.listOfLists[this.currentList - 1][0] = this.listOfLists[
              this.currentList
            ][this.selectedLine];
            this.listOfLists[this.currentList].splice(this.selectedLine, 1);
          } else {
            //console.log("The above list contains somthing");
            this.listOfLists[this.currentList - 1].push(
              this.listOfLists[this.currentList].shift()
            );
          }
          this.$forceUpdate();
        }
      } else {
        //console.log("Not at the top of list (Move normally)");
        let swapout = null;
        swapout = this.listOfLists[this.currentList][this.selectedLine - 1];
        this.listOfLists[this.currentList][
          this.selectedLine - 1
        ] = this.listOfLists[this.currentList][this.selectedLine];
        this.listOfLists[this.currentList][this.selectedLine] = swapout;
        this.$forceUpdate();
      }
    },
    moveDown: function() {
      //console.log("down");
      if (this.selectedLine === this.listOfLists[this.currentList].length - 1) {
        //console.log("already at bottom?");
        if (this.listOfLists.length - 1 === this.currentList) {
          //console.log("Bottom of the Bottom");
        } else {
          if (this.listOfLists[this.currentList + 1].length === 0) {
            //console.log("The below list doesn't have anything in it");
            this.listOfLists[this.currentList + 1][0] = this.listOfLists[
              this.currentList
            ][this.selectedLine];
            this.listOfLists[this.currentList].splice(this.selectedLine, 1);
          } else {
            //console.log("The below list contains somthing");
            this.listOfLists[this.currentList + 1].unshift(
              this.listOfLists[this.currentList].pop()
            );
          }
          this.$forceUpdate();
        }
      } else {
        //console.log("Not at the bottom of list (Move normally)");
        let swapout = null;
        swapout = this.listOfLists[this.currentList][this.selectedLine + 1];
        this.listOfLists[this.currentList][
          this.selectedLine + 1
        ] = this.listOfLists[this.currentList][this.selectedLine];
        this.listOfLists[this.currentList][this.selectedLine] = swapout;
        this.$forceUpdate();
      }
    },
    moveLeft() {
      this.listOfListsStaged.push(
        this.listOfLists[this.currentList].splice(this.selectedLine, 1)[0]
      );
    },
    moveUpStaging() {
      if (this.selectedLineStaging === 0) {
        //console.log("already at top?");
      } else {
        //console.log("Not at the top of list (Move normally)");
        let swapout = null;
        swapout = this.listOfListsStaged[this.selectedLineStaging - 1];
        this.listOfListsStaged[
          this.selectedLineStaging - 1
        ] = this.listOfListsStaged[this.selectedLineStaging];
        this.listOfListsStaged[this.selectedLineStaging] = swapout;
        this.$forceUpdate();
      }
    },
    moveDownStaging() {
      if (this.selectedLineStaging === this.listOfListsStaged.length - 1) {
        //console.log("already at top?");
      } else {
        //console.log("Not at the bottom of list (Move normally)");
        let swapout = null;
        swapout = this.listOfListsStaged[this.selectedLineStaging + 1];
        this.listOfListsStaged[
          this.selectedLineStaging + 1
        ] = this.listOfListsStaged[this.selectedLineStaging];
        this.listOfListsStaged[this.selectedLineStaging] = swapout;
        this.$forceUpdate();
      }
    },
    moveRightStaging() {
      this.listOfLists[0].push(
        this.listOfListsStaged.splice(this.selectedLineStaging, 1)[0]
      );
    },
    retryQuestion() {
      this.dragDisabled = false;
      this.attempts = this.attempts - 1; //Decrease num of attempts left
      this.submit = false; //Reset submit button

      let i;
      let x;

      //Moves incorrect answers back to staging
      for (i = this.listOfLists.length - 1; i >= 0; i--) {
        for (x = this.listOfLists[i].length - 1; x >= 0; x--) {
          if (this.listOfLists[i][x].correct == true) {
            //do nothing
          } else {
            this.listOfLists[i][x].incorrect = false;
            this.listOfListsStaged.push(this.listOfLists[i].splice(x, 1)[0]);
          }
        }
      }
    },
    submitAnswers() {
      this.dragDisabled = true;
      this.submit = true; //Show retry button
      var i;
      var x;
      //var v;
      //var present = false;

      for (i = this.listOfLists.length - 1; i >= 0; i--) {
        for (x = this.listOfLists[i].length - 1; x >= 0; x--) {
          if (this.listOfLists[i][x].group === i) {
            this.listOfLists[i][x].correct = true;
            this.listOfLists[i][x].incorrect = false;
          } else {
            if (this.listOfLists[i][x].correct == true) {
              this.listOfLists[this.listOfLists[i][x].group].push(
                this.listOfLists[i].splice(x, 1)[0]
              );
            } else {
              this.listOfLists[i][x].correct = false;
              this.listOfLists[i][x].incorrect = true;
            }
          }
        }
      }

      //Moves correct answers from staging to listOfLists
      for (i = this.listOfListsStaged.length - 1; i >= 0; i--) {
        if (this.listOfListsStaged[i].correct == true) {
          this.listOfLists[this.listOfListsStaged[i].group].push(
            this.listOfListsStaged.splice(i, 1)[0]
          );
        }
      }
    },
    revealAnswers() {
      this.dragDisabled = true;
      this.answersRevealed = true;

      let i;

      for (i = this.listOfListsStaged.length - 1; i >= 0; i--) {
        this.listOfListsStaged[i].correct = true;
        this.listOfListsStaged[i].incorrect = false;
        this.listOfLists[this.listOfListsStaged[i].group].push(this.listOfListsStaged.splice(i, 1)[0])
      }
    },
    SetSelectedLine(listIndex, innerIndex) {
      this.selectedLine = innerIndex;
      this.currentList = listIndex;
      this.currentItem = this.listOfLists[this.currentList][this.selectedLine];
    },
    SetSelectedLineStaging(index) {
      this.selectedLineStaging = index;
      this.currentItem = this.listOfListsStaged[index];
    },
    refineMappedArray(completeListOfStatements) {
      var refinedArray = [];
      var order = 0;
      var listItem;
      this.lengthOfSections.length = 0;
      for (var i = 0; i < completeListOfStatements.length; i++) {
        this.lengthOfSections.push(completeListOfStatements[i].length);
        for (var x = 0; x < completeListOfStatements[i].length; x++) {
          if (completeListOfStatements[i][x].example == null) {
            listItem = {
              correct: false,
              incorrect: false,
              group: i,
              order: order,
              example: false,
              text: completeListOfStatements[i][x].text
            };
            order += 1;
            refinedArray.push(listItem);
          } else {
            listItem = {
              correct: true,
              incorrect: false,
              group: i,
              order: order,
              example: completeListOfStatements[i][x].example,
              text: completeListOfStatements[i][x].text
            };
            order += 1;
            refinedArray.push(listItem);
          }
        }
      }
      //console.log(refinedArray);
      return refinedArray;
    },
    disorderedArrayMethod(value) {
      //Step 3: Jumble the array
      //Randomizes array
      let fullArrayInOrder = value;
      var copy = [],
        n = fullArrayInOrder.length,
        i;
      // While there remain elements to shuffle…
      while (n) {
        // Pick a remaining element…
        i = Math.floor(Math.random() * fullArrayInOrder.length);

        // If not already shuffled, move it to the new array.
        if (i in fullArrayInOrder) {
          copy.push(fullArrayInOrder[i]);
          delete fullArrayInOrder[i];
          n--;
        }
      }
      return copy;
    },
    splitArrayIntoChunks(refinedArrayDisordered) {
      //Step 3: Seperate array into the 7 distinct lists and place these into a single array
      let refinedArrayDisorderedAndSplit = [];
      var previous = 0;
      var next = 0;
      let i;
      for (i = 0; i < this.lengthOfSections.length; i++) {
        next = next + this.lengthOfSections[i];
        refinedArrayDisorderedAndSplit.push(
          refinedArrayDisordered.slice(previous, next)
        );
        previous = next;
      }

      return refinedArrayDisorderedAndSplit;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.sticky {
  position: -webkit-sticky; /* Safari */
  position: sticky;
  top: 35px;
}
.activity-wrapper {
  display: flex;
}
.left-wrapper,
.right-wrapper {
  flex: 1;
  margin: 5px;
}
.title {
  margin-bottom: 0.5em;
}
.row {
  margin: 10px;
}
.col {
  margin-bottom: 10px;
  background-color: #fff;
  border: 2px solid rgba(0, 0, 0, 1);
  border-radius: 12px;
  -moz-border-radius: 6px;
  -webkit-border-radius: 6px;
}
.draggable-list-container {
  display: block;
  justify-content: center;
  min-height: 200px;
}
.list-group {
  min-height: 80px;
  padding: 5px;
  background: rgba(203, 232, 226, 1);
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}
.staging-list-group {
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
}
.list-group-item {
  position: relative;
  display: inline-flex;
  justify-content: center;
  padding: 0.75rem 1.25rem;
  margin-bottom: 4px;
  margin-right: 4px;
  margin-left: 4px;
  background-color: #fff;
  border: 2px solid rgba(0, 0, 0, 1);
  border-radius: 12px;
  -moz-border-radius: 6px;
  -webkit-border-radius: 6px;
  font-size: 1.2em;
}
.list-group-item {
  cursor: move;
}
/* GENERAL BUTTON STYLING */
button,
button::after {
  -webkit-transition: all 0.3s;
  -moz-transition: all 0.3s;
  -o-transition: all 0.3s;
  transition: all 0.3s;
}

button {
  background: none;
  border: 3px solid rgb(0, 0, 0);
  color: rgb(0, 0, 0);
  display: block;
  font-size: 0.8em;
  font-weight: bold;
  margin: 1em auto;
  padding: 1em 5em;
  position: relative;
  text-transform: uppercase;
}

button::before,
button::after {
  background: rgb(0, 0, 0);
  content: "";
  position: absolute;
  z-index: -1;
}

button:hover {
  color: #ffffff;
}

button {
  overflow: hidden;
}

button::after {
  /*background-color: #f00;*/
  height: 100%;
  left: -35%;
  top: 0;
  transform: skew(50deg);
  transition-duration: 0.6s;
  transform-origin: top left;
  width: 0;
}

button:hover:after {
  height: 100%;
  width: 136%;
}

button:focus {
  background: black;
  color: white;
}
</style>
