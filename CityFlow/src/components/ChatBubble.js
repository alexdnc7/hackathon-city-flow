import { Image, StyleSheet, Text, View } from 'react-native';

export default function ChatBubble({ message }) {
  const isUser = message.sender === 'user';
  // Detectăm dacă e mesaj de reward (conține "Traffic") — nu tratăm mesaje cu 'Coins'
  const isReward = !isUser && (message.text && message.text.includes("Traffic"));

  return (
    <View style={[
      styles.container, 
      isUser ? styles.userContainer : styles.aiContainer
    ]}>
      {/* Avatar AI - Cerc mic cu "AI" */}
      {!isUser && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>AI</Text>
        </View>
      )} 

      <View style={[
        styles.bubble,
        isUser ? styles.userBubble : (isReward ? styles.rewardBubble : styles.aiBubble)
      ]}>
        {message.type === 'image' ? (
          <Image source={{ uri: message.imageUri }} style={styles.imageContent} />
        ) : (
          <Text style={[
            styles.text, 
            isUser ? styles.userText : styles.aiText
          ]}>
            {message.text}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 8, flexDirection: 'row', alignItems: 'flex-start' }, // Aliniere sus
  userContainer: { justifyContent: 'flex-end' },
  aiContainer: { justifyContent: 'flex-start' },
  
  // Avatarul mic rotund "AI"
  avatar: { 
    width: 35, 
    height: 35, 
    borderRadius: 17.5, 
    backgroundColor: '#F0F0F0', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 10,
    marginTop: 5 
  },
  avatarText: { fontSize: 10, fontWeight: 'bold', color: '#555' },

  bubble: { maxWidth: '75%', padding: 16, borderRadius: 24 },
  
  // Stilul Negru pentru User (Ca în poză)
  userBubble: { 
    backgroundColor: '#000000', 
    borderBottomRightRadius: 4 
  },
  
  // Stilul Gri pentru AI (Mesaj normal)
  aiBubble: { 
    backgroundColor: '#F5F5F5', 
    borderTopLeftRadius: 4 
  },

  // Stilul Bej/Portocaliu pentru Reward (Ca în poză)
  rewardBubble: { 
    backgroundColor: '#FFE0B2', // Culoarea exactă din screenshot
    borderTopLeftRadius: 4
  },

  text: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#FFF', fontWeight: '500' },
  aiText: { color: '#333', fontWeight: '400' },
  imageContent: { width: 200, height: 150, borderRadius: 15 }
});