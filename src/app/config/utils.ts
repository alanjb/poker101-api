export const CARD_REGEX = /^(Ace|Jack|Queen|King|2|3|4|5|6|7|8|9|10)( of )(Clubs|Diamonds|Hearts|Spades)$/;

export const errorFunction = (errorBit, msg, data?) => {
  if (errorBit) {
    return { is_error: errorBit, message: msg };
  }
  else {
    return { is_error: errorBit, message: msg, data };
  }
}