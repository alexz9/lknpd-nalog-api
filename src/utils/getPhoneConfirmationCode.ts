import readline from "readline";
import { stdin as input, stdout as output } from "process";

export default function getPhoneConfirmationCode() {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input, output });
    rl.question("Enter confirmation code from SMS: ", (answer) => {            
      rl.close();
      resolve(answer);
    });    
  });
}