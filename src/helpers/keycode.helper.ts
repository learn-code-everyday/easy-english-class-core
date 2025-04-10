export class KeycodeHelper {
  /*
   * Remove Commas
   */
  static removeCommas(word: string) {
    return word.replace(/,/g, "");
  }

  /*
   * Generate alpha-numeric referral code
   */
  static alphaNumeric(type: AlphaNumericTypes, wordLength: any, numLength: any) {
    // english alphabets
    let alphabets = [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
    ];

    // english numbers
    let numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    // check if word case is supplied
    if (type == null || type == "") {
      return "word case type is required.";
    } else {
      // check for word case type
      if (type == AlphaNumericTypes.uppercase) {
        // check for wordLength
        if (wordLength.length < 1) {
          return "length of alphabets to be generated is required.";
        } else {
          // check params type
          if (typeof wordLength !== "number") {
            return "wordLength must be a number.";
          } else {
            // check for numLength
            if (numLength.length > 1) {
              return "number of random digits to be generated is required.";
            } else {
              // check params type
              if (typeof numLength !== "number") {
                return "number of random digits must be a number";
              } else {
                // alphabets and numbers collection array
                let picks = [];

                // loop through alphabets array and pick an alphabet with the generated index
                for (let i = 0; i < wordLength; i++) {
                  let key = Math.floor(Math.random() * alphabets.length);
                  picks.push(alphabets[key].toUpperCase());

                  // loop through numbers array and pick a number with the generated index
                  for (let k = 0; k < numLength; k++) {
                    let pin = Math.floor(Math.random() * numbers.length);
                    picks.push(numbers[pin]);
                  }
                }

                // convert selected alphabets array to string and remove separating commas
                let letters = picks.toString();
                let data = this.removeCommas(letters);

                // return letters in word case format and numbers
                return data;
              }
            }
          }
        }
      } else {
        // check for wordLength
        if (wordLength.length < 1) {
          return "length of alphabets to be generated is required.";
        } else {
          // check params type
          if (typeof wordLength !== "number") {
            return "wordLength must be a number.";
          } else {
            // check for numLength
            if (numLength.length > 1) {
              return "number of random digits to be generated is required.";
            } else {
              // check params type
              if (typeof numLength !== "number") {
                return "number of random digits must be a number";
              } else {
                // alphabets and numbers collection array
                let picks = [];

                // loop through alphabets array and pick an alphabet with the generated index
                for (let i = 0; i < wordLength; i++) {
                  let key = Math.floor(Math.random() * alphabets.length);
                  picks.push(alphabets[key].toLowerCase());

                  // loop through numbers array and pick a number with the generated index
                  for (let k = 0; k < numLength; k++) {
                    let pin = Math.floor(Math.random() * numbers.length);
                    picks.push(numbers[pin]);
                  }
                }

                // convert selected alphabets array to string and remove separating commas
                let letters = picks.toString();
                let data = this.removeCommas(letters);

                // return letters in word case format and numbers
                return data;
              }
            }
          }
        }
      }
    }
  }

  /*
   * Generates alpha referral code
   * @params { type, wordLength }
   */
  static alpha(type: any, wordLength: any) {
    // english alphabets
    let alphabets = [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
    ];

    // check if word case is supplied
    if (type == null || type == "") {
      return "word case type is required.";
    } else {
      // check for word case type
      if (type == "uppercase") {
        // check for wordLength
        if (wordLength.length < 1) {
          return "length of alphabets to be generated is required.";
        } else {
          // check params type
          if (typeof wordLength !== "number") {
            return "wordLength must be a number.";
          } else {
            // alphabets collection array
            let picks = [];

            // loop through array and pick an alphabet with the generated index
            for (let i = 0; i < wordLength; i++) {
              let key = Math.floor(Math.random() * alphabets.length);
              picks.push(alphabets[key]);
            }

            // convert selected alphabets array to string and remove separating commas
            let letters = picks.toString();
            let data = this.removeCommas(letters);

            // return letters in word case format
            return data.toUpperCase();
          }
        }
      } else {
        // check for wordLength
        if (wordLength.length < 1) {
          return "length of alphabets to be generated is required.";
        } else {
          // check params type
          if (typeof wordLength !== "number") {
            return "wordLength must be a number.";
          } else {
            // alphabets collection array
            let picks = [];

            // loop through array and pick an alphabet with the generated index
            for (let i = 0; i < wordLength; i++) {
              let key = Math.floor(Math.random() * alphabets.length);
              picks.push(alphabets[key]);
            }

            // convert selected alphabets array to string and remove separating commas
            let letters = picks.toString();
            let data = this.removeCommas(letters);

            // return letters in word case format
            return data.toLowerCase();
          }
        }
      }
    }
  }

  /*
   * Generate custom referral code
   * @params { secret, wordLength, numLength, type }
   */
  static custom(type: any, wordLength: any, numLength: any, secret: any) {
    // check for the secret length
    if (secret.length > 1) {
      // check for word length
      if (typeof wordLength !== "number") {
        return "word length to chunk must be a number";
      } else {
        // check if secret length is greater than word length
        if (secret.length > wordLength) {
          // extract code word
          let chunked_name = secret.slice(0, wordLength);

          // check for word case
          if (type != null) {
            // check word case type
            if (type == "uppercase") {
              // check for random number length
              if (numLength > 1) {
                // generate random number
                // Math.floor(100000 + Math.random() * 900000)
                let code = Math.floor(
                  Math.pow(10, numLength - 1) + Math.random() * 9 * Math.pow(10, numLength - 1),
                );

                // referral code
                return chunked_name.toUpperCase() + "" + code;
              } else {
                return "random number length is required.";
              }
            } else if (type == "lowercase") {
              // check for random number length
              if (numLength > 1) {
                // generate random number
                let code = Math.floor(
                  Math.pow(10, numLength - 1) + Math.random() * 9 * Math.pow(10, numLength - 1),
                );

                // referral code
                return chunked_name.toLowerCase() + "" + code;
              } else {
                return "random number length is required.";
              }
            } else {
              // check for random number length
              if (numLength > 1) {
                // generate random number
                let code = Math.floor(
                  Math.pow(10, numLength - 1) + Math.random() * 9 * Math.pow(10, numLength - 1),
                );

                // referral code
                return chunked_name + "" + code;
              } else {
                return "random number length is required.";
              }
            }
          } else {
            // generate random number
            let code = Math.floor(100000 + Math.random() * 900000);

            // referral code
            return chunked_name + "" + code;
          }
        } else {
          return "secret's length should be greater than word length.";
        }
      }
    } else {
      return "secret is required.";
    }
  }
}

export enum AlphaNumericTypes {
  uppercase = "uppercase",
  "" = "",
}
