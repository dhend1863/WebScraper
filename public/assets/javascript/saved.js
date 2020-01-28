/* global bootbox */
$(document).ready(function() {
    // Getting a reference to the article container div we will be rendering all articles inside of
    const articleContainer = $(".article-container");
    // Adding event listeners for dynamically generated buttons for deleting articles,
    // pulling up article notes, saving article notes, and deleting article notes
    $(document).on("click", ".btn.delete", handleArticleDelete);
    $(document).on("click", ".btn.notes", handleArticleNotes);
    $(document).on("click", ".btn.save", handleNoteSave);
    $(document).on("click", ".btn.note-delete", handleNoteDelete);
    $(".clear").on("click", handleArticleClear);
  
    function initPage() {
      // Empty the article container, run an AJAX request for any saved headlines
      $.get("/api/headlines?saved=true").then(function(data) {
        articleContainer.empty();
        // If we have headlines, render them to the page
        if (data && data.length) {
          renderArticles(data);
        } else {
          // Otherwise render a message explaining we have no articles
          renderEmpty();
        }
      });
    }
  
    function renderArticles(articles) {
      // This function handles appending HTML containing our article data to the page
      // We are passed an array of JSON containing all available articles in our database
      const articlePanel = [];
      // We pass each article JSON object to the createCard function which returns a bootstrap
      // card with our article data inside
      for (var i = 0; i < articles.length; i++) {
        articlePanel.push(createPanel(articles[i]));
      }
      // Once we have all of the HTML for the articles stored in our articleCards array,
      // append them to the articleCards container
      articleContainer.append(articlePanel);
    }
  
    function createPanel(article) {
      // This function takes in a single JSON object for an article/headline
      // It constructs a jQuery element containing all of the formatted HTML for the
      // article card
      const panel = $("<div class='panel'>");
      const panelHeader = $("<div class='panel-header'>").append(
        $("<h3>").append(
          $("<a class='article-link' target='_blank' rel='noopener noreferrer'>")
            .attr("href", article.url)
            .text(article.headline),
          $("<a class='btn btn-danger delete'>Delete From Saved</a>"),
          $("<a class='btn btn-info notes'>Article Notes</a>")
        )
      );
  
      var panelBody = $("<div class='panel-body'>").text(article.summary);
  
      panel.append(panelHeader, panelBody);
  
      // We attach the article's id to the jQuery element
      // We will use this when trying to figure out which article the user wants to remove or open notes for
      panel.data("_id", article._id);
      // We return the constructed card jQuery element
      return panel;
    }
  
    function renderEmpty() {
      // This function renders some HTML to the page explaining we don't have any articles to view
      // Using a joined array of HTML string data because it's easier to read/change than a concatenated string
      const emptyAlert = $(
        [
          "<div class='alert alert-warning text-center'>",
          "<h4>Uh Oh. Looks like we don't have any saved articles.</h4>",
          "</div>",
          "<div class='panel'>",
          "<div class='panel-header text-center'>",
          "<h3>Would You Like to Browse Available Articles?</h3>",
          "</div>",
          "<div class='panel-body text-center'>",
          "<h4><a href='/'>Browse Articles</a></h4>",
          "</div>",
          "</div>"
        ].join("")
      );
      // Appending this data to the page
      articleContainer.append(emptyAlert);
    }
  
    function renderNotesList(data) {
      // This function handles rendering note list items to our notes modal
      // Setting up an array of notes to render after finished
      // Also setting up a currentNote variable to temporarily store each note
      const notesToRender = [];
      const currentNote;
      if (!data.notes.length) {
        // If we have no notes, just display a message explaining this
        currentNote = $("<li class='list-group-item'>No notes for this article yet.</li>");
        notesToRender.push(currentNote);
      } else {
        // If we do have notes, go through each one
        for (var i = 0; i < data.notes.length; i++) {
          // Constructs an li element to contain our noteText and a delete button
          currentNote = $("<li class='list-group-item note'>")
            .text(data.notes[i].noteText)
            .append($("<button class='btn btn-danger note-delete'>x</button>"));
          // Store the note id on the delete button for easy access when trying to delete
          currentNote.children("button").data("_id", data.notes[i]._id);
          // Adding our currentNote to the notesToRender array
          notesToRender.push(currentNote);
        }
      }
      // Now append the notesToRender to the note-container inside the note modal
      $(".note-container").append(notesToRender);
    }
  
    function handleArticleDelete() {
      // This function handles deleting articles/headlines
      // We grab the id of the article to delete from the card element the delete button sits inside
      const articleToDelete = $(this)
        .parents(".panel")
        .data();
  
      // Remove card from page
      $(this)
        .parents(".panel")
        .remove();
      // Using a delete method here just to be semantic since we are deleting an article/headline
      console.log(articleToDelete._id)
      $.ajax({
        method: "DELETE",
        url: "/api/headlines/" + articleToDelete._id
      }).then(function(data) {
        // If this works out, run initPage again which will re-render our list of saved articles
        if (data) {
          // initPage();
          window.load = "/saved"
        }
      });
    }
    function handleArticleNotes(event) {
      // This function handles opening the notes modal and displaying our notes
      // We grab the id of the article to get notes for from the card element the delete button sits inside
      const currentArticle = $(this)
        .parents(".panel")
        .data();
      console.log(currentArticle)
      // Grab any notes with this headline/article id
      $.get("/api/notes/" + currentArticle._id).then(function(data) {
        console.log(data)
        // Constructing our initial HTML to add to the notes modal
        const modalText = $("<div class='container-fluid text-center'>").append(
          $("<h4>").text("Notes For Article: " + currentArticle._id),
          $("<hr>"),
          $("<ul class='list-group note-container'>"),
          $("<textarea placeholder='New Note' rows='4' cols='60'>"),
          $("<button class='btn btn-success save'>Save Note</button>")
        );
        console.log(modalText)
        // Adding the formatted HTML to the note modal
        bootbox.dialog({
          message: modalText,
          closeButton: true
        });
        var noteData = {
          _id: currentArticle._id,
          notes: data || []
        };
        console.log('noteData:' + JSON.stringify(noteData))
        // Adding some information about the article and article notes to the save button for easy access
        // When trying to add a new note
        $(".btn.save").data("article", noteData);
        // renderNotesList will populate the actual note HTML inside of the modal we just created/opened
        renderNotesList(noteData);
      });
    }
  
    function handleNoteSave() {
      // This function handles what happens when a user tries to save a new note for an article
      // Setting a variable to hold some formatted data about our note,
      // grabbing the note typed into the input box
      var noteData;
      var newNote = $(".bootbox-body textarea")
        .val()
        .trim();
      // If we actually have data typed into the note input field, format it
      // and post it to the "/api/notes" route and send the formatted noteData as well
      if (newNote) {
        noteData = { _headlineId: $(this).data("article")._id, noteText: newNote };
        $.post("/api/notes", noteData).then(function() {
          // When complete, close the modal
          bootbox.hideAll();
        });
      }
    }
  
    function handleNoteDelete() {
      // This function handles the deletion of notes
      // First we grab the id of the note we want to delete
      // We stored this data on the delete button when we created it
      var noteToDelete = $(this).data("_id");
      // Perform an DELETE request to "/api/notes/" with the id of the note we're deleting as a parameter
      $.ajax({
        url: "/api/notes/" + noteToDelete,
        method: "DELETE"
      }).then(function() {
        // When done, hide the modal
        bootbox.hideAll();
      });
    }
  
    function handleArticleClear() {
      $.get("api/clear")
        .then(function(data) {
          articleContainer.empty();
          // initPage();
          location.reload();
        });
    }
  });