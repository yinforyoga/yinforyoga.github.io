/**
 * Creates a Google Form for the Lower Body & Hip Mobility Workshop.
 *
 * How to use:
 * 1. Go to https://script.google.com and create a new Apps Script project.
 * 2. Paste this file into Code.gs.
 * 3. Update WORKSHOP_PRICE, UPI_ID, PAYEE_NAME, CONTACT_EMAIL, and optional QR_IMAGE_FILE_ID.
 * 4. Run createWorkshopRegistrationForm().
 * 5. Authorize the script, then check the Apps Script logs for the edit and public form URLs.
 */

const WORKSHOP_TITLE = "Lower Body & Hip Mobility Workshop";
const WORKSHOP_DATE = "31st May";
const WORKSHOP_MODE = "Online";
const WORKSHOP_PRICE = "INR ___";
const UPI_ID = "your-upi-id@bank";
const PAYEE_NAME = "Yin for Yoga";
const CONTACT_EMAIL = "your-email@example.com";

// Optional: upload a UPI QR image to Google Drive and paste its file ID here.
// Leave blank if you only want to show the UPI ID.
const QR_IMAGE_FILE_ID = "";

function createWorkshopRegistrationForm() {
  const form = FormApp.create(`${WORKSHOP_TITLE} Registration`)
    .setTitle(`${WORKSHOP_TITLE} Registration`)
    .setDescription(
      [
        `${WORKSHOP_TITLE}`,
        `${WORKSHOP_DATE} | ${WORKSHOP_MODE}`,
        "",
        "Please complete this form after making your UPI payment.",
        `Fee: ${WORKSHOP_PRICE}`,
        `UPI ID: ${UPI_ID}`,
        `Payee name: ${PAYEE_NAME}`,
        "",
        "Once your payment is verified, the workshop link will be shared on WhatsApp or email."
      ].join("\n")
    )
    .setCollectEmail(true)
    .setAllowResponseEdits(true)
    .setConfirmationMessage(
      "Thank you for registering. Your payment details have been received for verification. The workshop link will be shared on WhatsApp or email once payment is confirmed."
    );

  form.addSectionHeaderItem()
    .setTitle("Workshop Details")
    .setHelpText(
      [
        `${WORKSHOP_TITLE}`,
        `Date: ${WORKSHOP_DATE}`,
        `Mode: ${WORKSHOP_MODE}`,
        "Focus: hips, lower back, glutes, hamstrings, legs, and lower body mobility."
      ].join("\n")
    );

  form.addTextItem()
    .setTitle("Full name")
    .setRequired(true);

  form.addTextItem()
    .setTitle("WhatsApp number")
    .setHelpText("Please include country code if outside India.")
    .setValidation(
      FormApp.createTextValidation()
        .requireTextMatchesPattern("^[0-9+()\\-\\s]{8,20}$")
        .setHelpText("Enter a valid phone number.")
        .build()
    )
    .setRequired(true);

  form.addTextItem()
    .setTitle("Email address for workshop link")
    .setValidation(
      FormApp.createTextValidation()
        .requireTextIsEmail()
        .setHelpText("Enter a valid email address.")
        .build()
    )
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("Which best describes you?")
    .setChoiceValues([
      "Desk-job professional",
      "IT employee",
      "Content creator",
      "Student",
      "Freelancer",
      "I sit for long hours",
      "Other"
    ])
    .showOtherOption(true)
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle("What areas feel stiff or need attention?")
    .setChoiceValues([
      "Hips",
      "Lower back",
      "Glutes",
      "Hamstrings",
      "Legs",
      "General lower body mobility",
      "Posture/body awareness"
    ])
    .showOtherOption(true)
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle("Do you have any injuries, pain, surgery history, pregnancy, or medical conditions the instructor should know about?")
    .setHelpText("Write 'None' if not applicable.")
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("Current movement/yoga experience")
    .setChoiceValues([
      "Beginner",
      "Some experience",
      "Regular practice",
      "Returning after a break/injury"
    ])
    .setRequired(true);

  form.addSectionHeaderItem()
    .setTitle("Payment")
    .setHelpText(
      [
        "Please complete your UPI payment before submitting this form.",
        `Amount: ${WORKSHOP_PRICE}`,
        `UPI ID: ${UPI_ID}`,
        `Payee name: ${PAYEE_NAME}`
      ].join("\n")
    );

  if (QR_IMAGE_FILE_ID) {
    const qrImage = DriveApp.getFileById(QR_IMAGE_FILE_ID).getBlob();
    form.addImageItem()
      .setTitle("UPI QR Code")
      .setImage(qrImage);
  }

  form.addMultipleChoiceItem()
    .setTitle("Payment method")
    .setChoiceValues(["UPI"])
    .setRequired(true);

  form.addTextItem()
    .setTitle("UPI transaction/reference ID")
    .setHelpText("Paste the UPI transaction ID/reference number from your payment app.")
    .setRequired(true);

  form.addTextItem()
    .setTitle("Name used for payment")
    .setHelpText("Enter the payer name as shown in the payment app, if different from your registration name.")
    .setRequired(false);

  form.addTextItem()
    .setTitle("Payment screenshot link, if available")
    .setHelpText("Optional: upload the screenshot to Drive and paste a shareable link here.")
    .setValidation(
      FormApp.createTextValidation()
        .requireTextMatchesPattern("^(https?://.+)?$")
        .setHelpText("Paste a valid URL, or leave this blank.")
        .build()
    )
    .setRequired(false);

  form.addCheckboxItem()
    .setTitle("Consent and acknowledgement")
    .setChoiceValues([
      "I confirm that the details provided are correct.",
      "I understand this is a movement workshop and I will listen to my body during the session.",
      "I understand the workshop link will be shared after payment verification."
    ])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle("Anything else you would like the instructor to know?")
    .setRequired(false);

  const responseSheet = SpreadsheetApp.create(`${WORKSHOP_TITLE} Responses`);
  form.setDestination(FormApp.DestinationType.SPREADSHEET, responseSheet.getId());

  Logger.log(`Edit URL: ${form.getEditUrl()}`);
  Logger.log(`Public form URL: ${form.getPublishedUrl()}`);
  Logger.log(`Responses sheet URL: ${responseSheet.getUrl()}`);

  return {
    editUrl: form.getEditUrl(),
    publicUrl: form.getPublishedUrl(),
    responsesSheetUrl: responseSheet.getUrl()
  };
}
