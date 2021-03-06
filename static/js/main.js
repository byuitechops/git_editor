(function($){
	$(document).ready(function(){
		$('.header-panel').hide();

		var file_sha;
		var file_path;

		var myCodeMirror = CodeMirror.fromTextArea(document.getElementById('editor_textarea'), {
			mode: "Github-Flavored Markdown",
			lineWrapping: true
		});

		function getHtmlVersion() {
			$.ajax({
				type: "POST",
				url: 'https://api.github.com/markdown/raw',
				data: myCodeMirror.getValue(),
				contentType: 'text/plain'
			})
			.done(function(result){
				$('.editorTools').hide();
				$('.CodeMirror').hide();
				$('#settings_window').hide();
				$('#preview_window').show(600);
				$('#preview_window').html(result);
			});
		}

		// CLICK HANDLER: for hovering edit button
		$( "#preview" ).click(function(event) {
			event.preventDefault();
			$('.current-menu-item').removeClass('current-menu-item');
			$('#preview').parent().addClass('current-menu-item');
			$('#commit_window').hide();
			$('#save_window').hide();
			$('#settings_window').hide();
			getHtmlVersion();
		});
		$( "#edit" ).click(function(event) {
			event.preventDefault();
			$('.current-menu-item').removeClass('current-menu-item');
			$('#edit').parent().addClass('current-menu-item');
			$('#preview_window').hide();
			$('#commit_window').hide();
			$('#save_window').hide();
			$('#settings_window').hide();
			$('.editorTools').show(600);
			$('.CodeMirror').show(600);
			$('.CodeMirror').fadeIn();
		});
		$( "#versions" ).click(function(event) {
			event.preventDefault();
			$('.current-menu-item').removeClass('current-menu-item');
			$('#versions').parent().addClass('current-menu-item');

			$.get("https://api.github.com/repos/byuitechops/byuitechops.github.io/commits", function(data){
	    }).done(function(data) {
				$('.editorTools').hide();
				$('.CodeMirror').hide();
				$('#save_window').hide();
				$('#preview_window').hide();
				$('#settings_window').hide();
				$('#commit_window').show(600);
				$('#commit_window').html(data);


				var commitTable;
				commitTable = "<span><h3>Note: </h3><span>This will also provide a link to see changes made in each previous version.</span></span>";
				$.each(data, function( index, value ) {

					var author = data[index].commit.author.name;
					var date = data[index].commit.author.date;
					var message = data[index].commit.message;

					//Convert date format
					var newDate = moment(date).format("ddd MMM Do 'YY (h:mm:ss a)");

					if (index == 0) {
						commitTable += "<table class='commitTable'><tr><th>Author</th><th>Date</th><th>Message</th></tr>";
					}
					commitTable += "<tr><td>" + author + "</td><td>" + newDate + "</td><td>" + message + "</td></tr>";
					if (index == data.length) {
						commitTable += "</table>";
					}
				});
				document.getElementById('commit_window').innerHTML = commitTable;
			});


		});
		$( "#settings" ).click(function(event) {
			event.preventDefault();
			$('.current-menu-item').removeClass('current-menu-item');
			$('#settings').parent().addClass('current-menu-item');
			$('.editorTools').hide();
			$('.CodeMirror').hide();
			$('#save_window').hide();
			$('#commit_window').hide();
			$('#preview_window').hide();
			$('#settings_window').show(600);
		});
		$( "#save" ).click(function(event) {
			event.preventDefault();
			$('.editorTools').hide();
			$('.CodeMirror').hide();
			$('#commit_window').hide();
			$('#preview_window').hide();
			$('#save_window').show(600);
			$('.current-menu-item').removeClass('current-menu-item');
			$('#save').parent().addClass('current-menu-item');
			var b64_content = window.btoa(myCodeMirror.getValue());
			console.log("b64 unicode: ", b64_content);

			$.ajax({
				type: "PUT",
				url: 'https://api.github.com/repos/byuitechops/byuitechops.github.io/contents/' + file_path,
				path: file_path,
				message: 'This is a test to update via API',
				content: b64_content,
				sha: file_sha
			})
			.done(function(result){
				console.log("RESULT: ", result);
				console.log("Done...");
			});

		});
		// CLICK HANDLER: for hovering edit button
		$( "#initial_edit_btn" ).click(function() {
			// Update styling for editor view
			$(this).hide();
			$('#preview_window').hide();
			$('#settings_window').hide();
			$('.editorTools').show(600);
			$('.CodeMirror').show(600);
			$('.CodeMirror').fadeTo(400, 1);
			$('.editor_textarea').addClass('post_textarea');
			$('.body_view_container').removeClass('body_view_container', 2000, "swing");
			$('.editor_container').removeClass('editor_container', 2000, "swing");
			$('.editor_panel').removeClass('editor_panel', 2000, "swing");
			$('.pre_edit').removeClass('pre_edit', 2000, "swing");
			$('.hide').removeClass('hide', 2000, "swing");
			setTimeout(function(){
							$('.alterHeader').removeClass('alterHeader', 4000, "swing");
							$('.header-panel').show(600);
			}, 300);
		});

		$.get("https://api.github.com/repos/byuitechops/byuitechops.github.io/contents", function(data){
    }).done(function(data) {

			$.each(data, function( index, value ) {
				// console.log("Filename: ", value.name);
				// console.log("Type: ", value.type);
				// console.log("Download URL: ", value.download_url);

				/* NOTE - Store the following for the file update PUT:
					("Sha: ", value.sha)
					("Path: ", value.path)

					Also:
						Can pass along an optional parameter of "committer":
							REQUIRED parameters:
								- name (string)
								- email (string)
				*/

				var fileName = value.name;
				// console.log(fileName);
				if (index == 6) {
					file_sha = value.sha;
					file_path = value.path;
					$.get(value.download_url, function(result){
					}).done(function(result) {
						$('#pageTitle').html(fileName);
						myCodeMirror.setValue(result);
						// SET event listener for CodeMirror editor
						myCodeMirror.on('change', function(){
							if(!$('fa-floppy-o').hasClass('badgeTag')) {
							    $('.fa-floppy-o').addClass('badgeTag');
							}

						});
						getHtmlVersion();
					});
				}
			});
	  }).fail(function() {
	    console.log( "error" );
			$.get(this);
	  });

		//Editor button insertion
		function insertString(editor,str, syntax, bothSides){

        var selection = editor.getSelection();

        if (selection.length > 0) {
					if (syntax == "link") {
						editor.replaceSelection(str);
					} else {
						if (bothSides) {
							editor.replaceSelection(syntax + selection + syntax);
						} else {
							editor.replaceSelection(syntax + selection);
						}
					}
        } else {
            var doc = editor.getDoc();
            var cursor = doc.getCursor();

            var pos = {
               line: cursor.line,
               ch: cursor.ch
            }
            doc.replaceRange(str, pos);
        }
    }
		$(".dropdown-menu").click(function(e) {
		  e.stopPropagation();
		});
		$(".tableContainer").click(function(e) {
		  e.stopPropagation();
		});
		$(document).click(function() {
		  $(".dropdown-menu").hide();
			$('.tableContainer').hide();
			$('#linkURL').val('');
			$('#linkText').val('');
			$('#linkTarget').val('');
			$('#imageLink').val('');
			$('#imageAlt').val('');
			$('#imageTitle').val('');
		});
		$( "#undo" ).click(function() {
			myCodeMirror.undo();
		});
		$( "#redo" ).click(function() {
			myCodeMirror.redo();
		});
		$( "#h1" ).click(function() {
			insertString(myCodeMirror,"# Heading 1 ", " # ", false);
		});
		$( "#h2" ).click(function() {
			insertString(myCodeMirror,"## Heading 2 ", " ## ", false);
		});
		$( "#link" ).click(function() {
			var selection = myCodeMirror.getSelection();
			if (selection.length > 0) {
				$('#linkText').val(selection);
			}
			$('.insertImage').hide();
			$('.tableContainer').hide();
			$('.addTable').hide();
			$('.insertLink').show();
		});
		$( "#insertLinkBtn" ).click(function() {
			var linkVal;
			var hasTarget = false;
			if ($('#linkTarget').val().length > 0) {
				hasTarget = true;
			}

			if($('#linkText').val().length > 0 && !hasTarget) {
				linkVal = "[" + $('#linkText').val() + "](" + $('#linkURL').val() + ")";
			} else {
				linkVal = "<" + $('#linkURL').val() + ">";
			}

			if (hasTarget) {
				linkVal = '<a href="' + $('#linkURL').val() + '" target="' + $('#linkTarget').val() + '">' + $('#linkText').val() + '</a>'
			}
			insertString(myCodeMirror, linkVal, "link");
			$(".addTable").hide();
			$(".insertLink").hide();
			$('.tableContainer').hide();
			$('#linkURL').val('');
			$('#linkText').val('');
		});

		$( "#image" ).click(function() {
			$('.addTable').hide();
			$('.insertLink').hide();
			$('.tableContainer').hide();
			$('.insertImage').show();
		});
		$( "#insertImageBtn" ).click(function() {
			var linkVal;
			var hasAlt = false;
			var hasTitle = false;

			//Alt check
			if($('#imageAlt').val().length > 0) {
				hasAlt = true;
			}
			//Title check
			if($('#imageTitle').val().length > 0) {
				hasTitle = true;
			}

			if(hasAlt && hasTitle) {
				linkVal = "![" + $('#imageAlt').val() + "](" + $('#imageLink').val() + " \""+ $('#imageTitle').val() + "\")";
			} else if (hasAlt && !hasTitle){
				linkVal = "![" + $('#imageAlt').val() + "](" + $('#imageLink').val() + " \"Image\")";
			} else if (hasTitle && !hasAlt){
				linkVal = "![Image](" + $('#imageLink').val() + " \"" + $('#imageTitle').val() + "\")";
			} else {
				linkVal = "![Image](" + $('#imageLink').val() + " \"Image\")";
			}
			insertString(myCodeMirror, linkVal, "link");
			$(".addTable").hide();
			$('.tableContainer').hide();
			$(".insertImage").hide();
			$('#imageLink').val('');
			$('#imageAlt').val('');
			$('#imageTitle').val('');
		});

		$( "#bold" ).click(function() {
			insertString(myCodeMirror,"**bold**", "**", true);
		});
		$( "#italic" ).click(function() {
			insertString(myCodeMirror,"_italic_", "_", true);
		});
		$( "#quote" ).click(function() {
			insertString(myCodeMirror,"> Blockquote", "> ", false);
		});
		$( "#ul" ).click(function() {
			insertString(myCodeMirror,"* Bulleted", "* ", false);
		});
		$( "#ol" ).click(function() {
			insertString(myCodeMirror,"1. Numbered", "1. ", false);
		});
		$( "#tableBtn" ).click(function() {
			$('.insertLink').hide();
			$('.insertImage').hide();
			$('.tableContainer').hide();
			$('.addTable').show();
		});
		$( ".insertTable" ).click(function() {
			$('.tableContainer').hide();
			console.log("Inserting table...");
		});
		var colNum;
		var rowNum;
		var cellIndex;
		var currentRow;
		var currentRowNum;
		$( "#createTable" ).click(function() {
			$('.addTable').hide();
			$('.tableSpace').html('');
			$('.tableContainer').show();
			colNum = $('#colNum').val();
			rowNum = $('#rowNum').val();
			var innerTable = '';

			for (var i = 0; i < rowNum; i++) {
				innerTable += '<tr>';

				for (var j = 0; j < colNum; j++) {
					if (i == 0) {
						innerTable += '<td><input class="cellVal" type="text" placeholder="Column Header (th)" /></td>';
					} else {
						innerTable += '<td><input class="cellVal" type="text" /></td>';
					}
				}

				innerTable += '</tr>';
			}

			$('.tableSpace').html("<table class='editTable'>" + innerTable + "</table>");

			//Add event listener to input select
			$('.cellVal').on('click', function (e) {
					//FIND COLUMN - Finds cell position
					   cellIndex = e.target.closest('td').cellIndex
						 $('.tableOptions').show();

					// FIND ROW
					currentRow = e.target.closest('tr');
					currentRowNum = e.target.closest('tr').sectionRowIndex;

			});
			$('#colNum').val('');
			$('#rowNum').val('');
		});

		$('.tableContainer button').on('click', function (e) {
			e.stopPropagation();
		});
		$('.tableContainer').on('click', function () {
			if(!$('.cellVal').is(':focus')) {
				$('.tableOptions').hide();
			}
		});
		$('#killRow').on('click', function () {
			currentRow.remove();
		});
		$('#killCol').on('click', function () {
			$("tr").each(function() {
				$(this).find('td:eq("' + cellIndex + '")').remove();
			});
		});
		$('#addRow').on('click', function () {
				var newRow = '<tr>';
				for (var i = 0; i < $('.editTable').find('tr')[0].cells.length; i++) {
						newRow += '<td><input class="cellVal" type="text" /></td>';
				}
				newRow += '</tr>';
				// $('.editTable > tr').eq(currentRowNum).after(newRow);
				$('.editTable').find('tr:eq("' + currentRowNum + '")').after(newRow);
				// Have to re-setup event listener for new cells
				$('.cellVal').on('click', function (e) {
						//FIND COLUMN - Finds cell position
						   cellIndex = e.target.closest('td').cellIndex
							 $('.tableOptions').show();

						// FIND ROW
						currentRow = e.target.closest('tr');
						currentRowNum = e.target.closest('tr').sectionRowIndex;

				});
		});
		$('#addCol').on('click', function() {
			$("tr").each(function(i) {
				if (i == 0) {
					$(this).find('td:eq("' + cellIndex + '")').after('<td><input class="cellVal" type="text" placeholder="Column Header (th)" /></td>');
				} else {
					$(this).find('td:eq("' + cellIndex + '")').after('<td><input class="cellVal" type="text" /></td>');
				}
			});
			// Have to re-setup event listener for new cells
			$('.cellVal').on('click', function (e) {
					//FIND COLUMN - Finds cell position
					   cellIndex = e.target.closest('td').cellIndex
						 $('.tableOptions').show();

					// FIND ROW
					currentRow = e.target.closest('tr');
					currentRowNum = e.target.closest('tr').sectionRowIndex;

			});
		});
		$('.insertTableBtn').on('click', function() {
			var totalCols = $('.editTable').find('tr')[0].cells.length;
			var totalRows = $(".editTable > tbody > tr").length;
			var mdTable = '';

			for (var i = 0; i < totalRows; i++) {
				for (var j = 1; j <= totalCols; j++) {
					var row = $('.editTable').find('tr:eq("' + i + '")')

					if (i == 0) {
						// handle 'th' row set up
						mdTable += row.find("td:nth-child(" + j + ") input").val() + ' | ';
						if (j == totalCols) {
							mdTable += '\n';
							for (var h = 1; h <= totalCols; h++) {
								var inputLength = row.find("td:nth-child(" + j + ") input").val().length;
								var dashes = '';
								for (var d = 0; d < inputLength; d++) {
									dashes += '-';
								}
								mdTable += dashes + ' | ';
								if (h == totalCols) {
									mdTable += '\n';
								}
							}
						}
					} else {
						mdTable += row.find("td:nth-child(" + j + ") input").val() + ' | ';
						if (j == totalCols) {
							mdTable += '\n';
						}
					}
				}
			}
			$('.tableContainer').hide();
			insertString(myCodeMirror, mdTable, "link");

		});
	});
})(jQuery);
