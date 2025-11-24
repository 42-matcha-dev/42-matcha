// chats.js

const chatData = [
  {
    id: "45hg91KLaa73",
    users: [
      {
        image: "https://randomuser.me/api/portraits/women/12.jpg",
        status: "online",
        fullName: "Emily Jackson",
        uid: "6BJh82UEQ1",
        lastSeen: {
          seconds: 1732459200,
          nanoseconds: 500000000
        },
        email: "emily.jackson@example.com",
        username: "emilyJ"
      }
    ],
    lastMessage: "Hey Emily, tu es dispo cet après-midi ?"
  },

  {
    id: "78Pq02LKX55",
    users: [
      {
        image: "https://randomuser.me/api/portraits/men/20.jpg",
        status: "offline",
        fullName: "Lucas Bernard",
        uid: "9FGt03LDQ2",
        lastSeen: {
          seconds: 1732400000,
          nanoseconds: 210000000
        },
        email: "lucas.bernard@example.com",
        username: "lucasB"
      }
    ],
    lastMessage: "Ok nickel je te tiens au courant."
  },

  {
    id: "99YXv31QPT88",
    users: [
      {
        image: "https://randomuser.me/api/portraits/women/33.jpg",
        status: "busy",
        fullName: "Sofia Moretti",
        uid: "2KDm92HGW4",
        lastSeen: {
          seconds: 1732465000,
          nanoseconds: 120000000
        },
        email: "sofia.moretti@example.com",
        username: "sofiaM"
      }
    ],
    lastMessage: "Je regarde ça et je reviens vers toi."
  }
];

export default chatData;
