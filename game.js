const { useState, useEffect, useRef } = React;

// ورق لعب بالعربية والأرقام والألوان (اختصار)
const suits = ["♠", "♥", "♦", "♣"];
const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function createDeck() {
  const deck = [];
  for (let s = 0; s < suits.length; s++) {
    for (let r = 0; r < ranks.length; r++) {
      deck.push({ suit: suits[s], rank: ranks[r], id: `${suits[s]}-${r}` });
    }
  }
  return deck;
}

function Card({ card, faceUp = true, draggable = false, onDragStart, onDrop }) {
  const style = {
    width: 60,
    height: 90,
    borderRadius: 8,
    border: "1px solid #ccc",
    backgroundColor: faceUp ? "white" : "#444",
    color: (card.suit === "♥" || card.suit === "♦") ? "red" : "black",
    fontSize: 24,
    fontWeight: "bold",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
    userSelect: "none",
    cursor: draggable ? "grab" : "default",
  };

  return (
    React.createElement("div", {
      style,
      draggable: draggable,
      onDragStart: onDragStart,
      onDrop: onDrop,
      onDragOver: e => e.preventDefault(),
      id: card.id,
    }, faceUp ? `${card.rank}${card.suit}` : "")
  );
}

function PlayerHand({ hand, onCardDragStart, onCardDrop }) {
  // عرض الأوراق مع إمكانية السحب والإفلات لترتيب اليد
  return React.createElement("div", {
    style: {
      display: "flex",
      padding: 10,
      backgroundColor: "#1b5e20",
      borderRadius: 10,
      minHeight: 110,
      userSelect: "none",
      overflowX: "auto",
    }
  }, hand.map((card, i) =>
    React.createElement(Card, {
      key: card.id,
      card,
      draggable: true,
      faceUp: true,
      onDragStart: e => onCardDragStart(e, i),
      onDrop: e => onCardDrop(e, i),
    })
  ));
}

function OpponentHand({ hand }) {
  // أوراق الخصم تظهر بظهر الورق فقط
  return React.createElement("div", {
    style: {
      display: "flex",
      padding: 10,
      backgroundColor: "#1b5e20",
      borderRadius: 10,
      minHeight: 110,
      userSelect: "none",
      overflowX: "auto",
      justifyContent: "center",
      marginBottom: 20,
    }
  }, hand.map(card =>
    React.createElement(Card, {
      key: card.id,
      card,
      draggable: false,
      faceUp: false,
    })
  ));
}

function Deck({ count }) {
  // صندوق رزمة الورق (الدهك)
  return React.createElement("div", {
    style: {
      width: 70,
      height: 100,
      borderRadius: 8,
      backgroundColor: "#2e7d32",
      border: "2px solid white",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: "white",
      fontWeight: "bold",
      userSelect: "none",
      marginBottom: 10,
    }
  }, `الرزمة\n${count} ورقة`);
}

function DiscardPile({ cards }) {
  // البحر = أوراق تم رميها
  const topCard = cards.length > 0 ? cards[cards.length - 1] : null;
  return React.createElement("div", {
    style: {
      width: 70,
      height: 100,
      borderRadius: 8,
      backgroundColor: "#4caf50",
      border: "2px solid white",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: "white",
      fontWeight: "bold",
      userSelect: "none",
      marginBottom: 10,
    }
  }, topCard ? `${topCard.rank}${topCard.suit}` : "البحر");
}

function Game() {
  const [deck, setDeck] = useState(createDeck());
  const [discard, setDiscard] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [opponentHand, setOpponentHand] = useState([]);
  const dragCardIndex = useRef(null);

  useEffect(() => {
    // توزيع 5 ورقات لكل لاعب في البداية
    shuffle(deck);
    const pHand = deck.slice(0, 5);
    const oHand = deck.slice(5, 10);
    const restDeck = deck.slice(10);
    setPlayerHand(pHand);
    setOpponentHand(oHand);
    setDeck(restDeck);
  }, []);

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // سحب ورقة من الرزمة
  function drawCard() {
    if (deck.length === 0) return alert("لا توجد أوراق في الرزمة");
    const newCard = deck[0];
    setPlayerHand([...playerHand, newCard]);
    setDeck(deck.slice(1));
  }

  // رمي ورقة إلى البحر (البايظ)
  function throwCard() {
    if (dragCardIndex.current === null) {
      alert("اختر ورقة بالسحب قبل الرمي");
      return;
    }
    const card = playerHand[dragCardIndex.current];
    const newHand = playerHand.filter((_, i) => i !== dragCardIndex.current);
    setPlayerHand(newHand);
    setDiscard([...discard, card]);
    dragCardIndex.current = null;
  }

  // ترتيب اليد بالسحب والإفلات
  function onCardDragStart(e, index) {
    dragCardIndex.current = index;
  }

  function onCardDrop(e, dropIndex) {
    if (dragCardIndex.current === null) return;
    const draggedCard = playerHand[dragCardIndex.current];
    const newHand = playerHand.filter((_, i) => i !== dragCardIndex.current);
    newHand.splice(dropIndex, 0, draggedCard);
    setPlayerHand(newHand);
    dragCardIndex.current = null;
  }

  // زر انزل - هنا بس نعرض رسالة مثال
  function onPlaceCards() {
    alert("تم انزال المجموعات (مثال فقط)");
  }

  return React.createElement("div", {
    style: {
      width: 600,
      height: 600,
      backgroundColor: "#388e3c",
      borderRadius: 15,
      padding: 20,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      userSelect: "none",
    }
  },
    React.createElement(OpponentHand, { hand: opponentHand }),

    React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        marginBottom: 10,
      }
    },
      React.createElement(Deck, { count: deck.length }),
      React.createElement(DiscardPile, { cards: discard }),
    ),

    React.createElement(PlayerHand, {
      hand: playerHand,
      onCardDragStart,
      onCardDrop,
    }),

    React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "center",
        gap: 20,
        marginTop: 15,
      }
    },
      React.createElement("button", { onClick: drawCard }, "اسحب"),
      React.createElement("button", { onClick: throwCard }, "ارمي"),
      React.createElement("button", { onClick: onPlaceCards }, "انزل"),
    )
  );
}

ReactDOM.render(React.createElement(Game), document.getElementById("root"));