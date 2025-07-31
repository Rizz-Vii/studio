// Enhanced Firebase Functions - australia-southeast2
import { setGlobalOptions } from "firebase-functions/v2";

// Import chatbot functions
import { adminChatHandler, customerChatHandler } from "./chatbot";
// Import test function
import { testMinimal } from "./test-minimal";

setGlobalOptions({ region: "australia-southeast2" });

// Export chatbot functions
export { adminChatHandler, customerChatHandler, testMinimal };

// Note: sendBillingReminder exists as scheduled function in production
// but is not exported here to avoid deployment conflicts
