function getFinalized() {
  // get data
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const sheet1 = ss.getSheetByName('Form Responses 1')
  const sheet2 = ss.getSheetByName('Sheet 2')
  const data1 = sheet1.getDataRange().getValues()
  const data2 = sheet2.getDataRange().getValues()
  
  // store formatted submissions in array
  const submissions = []
  var submissionsStudentName = []
  for (var i = 1; i < data1.length; i++) {
    var currentRow = data1[i]
    var student = currentRow[5]
    var formattedSubmission = `${currentRow[5]}; ${currentRow[6]}`

    submissionsStudentName.push(student)
    submissions.push(formattedSubmission)
  }

  console.log(formattedSubmission)

  // go through each formatted submission, if there is higher bid somewhere in the submission data, set that as the option and push to final list
  var formattedSubmissions = []
  var formattedSubmissionsName = []

  for (var i = 0; i < submissions.length; i++) {
    var currentFormattedSubmission = submissions[i]
    var currentFormattedSubmissionName = currentFormattedSubmission.split('(')[0].trim()
    const currentBidArray = []
    for (var j = 0; j < submissions.length; j++) {
      var currentFormattedSubmission2 = submissions[j]
      var currentFormattedSubmissionName2 = currentFormattedSubmission2.split('(')[0].trim()

      if (currentFormattedSubmissionName == currentFormattedSubmissionName2) {
        var currentFormattedSubmissionBid = parseInt(currentFormattedSubmission2.split(';')[1].trim())
        currentBidArray.push(currentFormattedSubmissionBid)
      }
    }

    var updatedSubmission = `${currentFormattedSubmissionName} (current bidding: RM${Math.max.apply(Math, currentBidArray)})`
    formattedSubmissions.push(updatedSubmission)
    formattedSubmissionsName.push(currentFormattedSubmissionName)
  }
  formattedSubmissions = [...new Set(formattedSubmissions)]
  formattedSubmissionsName = [...new Set(formattedSubmissionsName)]

  console.log(formattedSubmissions)
  console.log(formattedSubmissionsName)


  // initialize form data except compare
  const updatedOptions = []
  for (var i = 1; i < data2.length; i++) {
    var currentRow = data2[i]
    var currentRowName = currentRow[0]
    var currentRowBid = currentRow[1]
    var updatedOption = `${currentRowName} (current bidding: RM${currentRowBid})`
    if (formattedSubmissionsName.includes(currentRowName)) {
      updatedOption = formattedSubmissions[formattedSubmissionsName.indexOf(currentRowName)]
    }
    updatedOptions.push(updatedOption)
  }
  console.log(updatedOptions)
}

function initializeForm() {
  const formID = '13_rhSzW37Kq9GtTb15vlSTjhYrSAW9uFLuW6yKfBgkI'
  const form = FormApp.openById(formID)
  const mcqID = '266293403'
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const sheet1 = ss.getSheetByName('Form Responses 1')
  const sheet2 = ss.getSheetByName('Sheet 2')
  const data1 = sheet1.getDataRange().getValues()
  const data2 = sheet2.getDataRange().getValues()

  // get Sheet2 data into correct format
  const options = []
  for (var i = 1; i < data2.length; i++) {
    var currentRow = data2[i]
    var option = `${currentRow[0]} (The current highest bid for this service is: RM${currentRow[1]})`
    options.push(option)
  }

  // initialize choice values
  const bidding = form.getItemById(mcqID).asMultipleChoiceItem()
  bidding.setChoiceValues(options)
}

function onSubmit() {
  // get form data
  const formID = '13_rhSzW37Kq9GtTb15vlSTjhYrSAW9uFLuW6yKfBgkI'
  const form = FormApp.openById(formID)
  const mcqID = '266293403'

  // get spreadsheet data
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const sheet1 = ss.getSheetByName('Form Responses 1')
  const sheet2 = ss.getSheetByName('Sheet 2')
  const data1 = sheet1.getDataRange().getValues()
  const data2 = sheet2.getDataRange().getValues()

  const studentServiceIdx = 5
  const bidIdx = 6

  var currentOptions = []
  const bidding = form.getItemById(mcqID).asMultipleChoiceItem()
  var options = bidding.getChoices()
  for (var i = 0; i < options.length; i++) {
    var studentServiceData = options[i].getValue()
    currentOptions.push(studentServiceData)
  }

  var allSubmissions = {}
  for (var i = 1; i < data1.length; i++) {
    var currentRow = data1[i]
    var studentServiceData = currentRow[studentServiceIdx]
    var studentService = studentServiceData.split('(')[0].trim()
    var bid = parseInt(currentRow[bidIdx])  // parse number
    allSubmissions[studentService] = bid
  }

  console.log(allSubmissions)
  
  var studentServiceArray = Object.keys(allSubmissions)
  var bidArray = Object.values(allSubmissions)

  var formattedOptions = []
  // get current submission using studentServiceArray.indexOf()
  for (var i = 0; i < currentOptions.length; i++) {
    var currentStudentService = currentOptions[i].split('(')[0].trim()
    var currentBid = parseInt(currentOptions[i].split(': RM')[1].split(')')[0])  // parse number
    var submittedBidIdx = studentServiceArray.indexOf(currentStudentService)
    if (submittedBidIdx != -1) {
      var submittedBid = bidArray[submittedBidIdx]
    } else {
      var submittedBid = 0
    }
    var finalizedBid = Math.max(submittedBid, currentBid)
    console.log(finalizedBid)
    var formattedOption = `${currentStudentService} (The current highest bid for this service is: RM${finalizedBid})`
    formattedOptions.push(formattedOption)
  }

  console.log(formattedOptions)
  bidding.setChoiceValues(formattedOptions) 
}
