// import { supabase } from '@/lib/supabase';
// import { Ionicons } from '@expo/vector-icons';
// import React, { useEffect, useRef } from 'react';
// import {
//     Alert,
//     Animated,
//     Easing,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View,
// } from 'react-native';

// interface ProfileSheetProps {
//   visible: boolean;
//   username: string;
//   onClose: () => void;
// }

// export default function ProfileSheet({
//   visible,
//   username,
//   onClose,
// }: ProfileSheetProps) {
//   const anim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     if (visible) {
//       Animated.timing(anim, {
//         toValue: 1,
//         duration: 280,
//         easing: Easing.out(Easing.ease),
//         useNativeDriver: true,
//       }).start();
//     } else {
//       Animated.timing(anim, {
//         toValue: 0,
//         duration: 220,
//         useNativeDriver: true,
//       }).start();
//     }
//   }, [visible]);

//   if (!visible) return null;

//   // Generate initials safely
//   const getInitials = (name: string) => {
//     if (!name || name.trim() === '' || name === 'User') return 'U';
//     const parts = name.trim().split(/\s+/);
//     return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
//   };

//   const initials = getInitials(username);

//   return (
//     <View style={styles.overlay}>
//       <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />

//       <Animated.View
//         style={[
//           styles.sheet,
//           {
//             transform: [
//               {
//                 translateY: anim.interpolate({
//                   inputRange: [0, 1],
//                   outputRange: [400, 0],
//                 }),
//               },
//             ],
//           },
//         ]}
//       >
//         <View style={styles.handle} />

//         <View style={styles.header}>
//           {/* Centered & polished avatar */}
//           <View style={styles.avatarWrapper}>
//             <View style={styles.avatarGlow} />
//             <View style={styles.avatar}>
//               <Text style={styles.avatarInitials}>{initials}</Text>
//             </View>
//             <View style={styles.onlineDot} />
//           </View>

//           <Text style={styles.name}>{username}</Text>
//           <Text style={styles.email}>Supabase User</Text>
//         </View>

//         <ProfileItem icon="volume-high" label="Sound Effects" />
//         <ProfileItem icon="pulse" label="Haptic Feedback" />
//         <ProfileItem icon="color-palette" label="Theme (Auto)" />

//         <TouchableOpacity
//           style={styles.logoutBtn}
//           onPress={async () => {
//             await supabase.auth.signOut();
//             Alert.alert('Logged out');
//             // Optional: router.replace('/(auth)/welcome');
//           }}
//         >
//           <Ionicons name="log-out-outline" size={20} color="#fff" />
//           <Text style={styles.logoutText}>Logout</Text>
//         </TouchableOpacity>
//       </Animated.View>
//     </View>
//   );
// }

// /* ---------- Sub Component ---------- */
// const ProfileItem = ({ icon, label }: { icon: string; label: string }) => (
//   <View style={styles.item}>
//     <Ionicons name={icon} size={20} color="#475569" />
//     <Text style={styles.itemText}>{label}</Text>
//     <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
//   </View>
// );

// /* ---------- Styles ---------- */
// const styles = StyleSheet.create({
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(0,0,0,0.4)',
//     justifyContent: 'flex-end',
//   },
//   sheet: {
//     backgroundColor: '#ffffff',
//     paddingHorizontal: 24,
//     paddingTop: 16,
//     paddingBottom: 32,
//     borderTopLeftRadius: 32,
//     borderTopRightRadius: 32,
//     minHeight: 380,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -6 },
//     shadowOpacity: 0.18,
//     shadowRadius: 20,
//     elevation: 16,
//   },
//   handle: {
//     width: 50,
//     height: 6,
//     backgroundColor: '#CBD5E1',
//     alignSelf: 'center',
//     borderRadius: 3,
//     marginBottom: 20,
//   },
//   header: {
//     alignItems: 'center',
//     marginBottom: 32,
//   },
//   avatarWrapper: {
//     position: 'relative',
//     marginBottom: 16,
//     alignItems: 'center',
//   },
//   avatarGlow: {
//     position: 'absolute',
//     width: 110,
//     height: 110,
//     borderRadius: 55,
//     backgroundColor: '#2563EB',
//     opacity: 0.15,
//     top: -15,
//     left: -15,
//   },
//   avatar: {
//     width: 90,
//     height: 90,
//     borderRadius: 45,
//     backgroundColor: '#2563EB',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 4,
//     borderColor: '#ffffff',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 10,
//     elevation: 10,
//   },
//   avatarInitials: {
//     color: '#ffffff',
//     fontSize: 38,
//     fontWeight: '800',
//     letterSpacing: 1.5,
//   },
//   onlineDot: {
//     position: 'absolute',
//     bottom: 10,
//     right: 10,
//     width: 16,
//     height: 16,
//     borderRadius: 8,
//     backgroundColor: '#22C55E',
//     borderWidth: 3,
//     borderColor: '#ffffff',
//   },
//   name: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: '#0F172A',
//     marginBottom: 4,
//   },
//   email: {
//     fontSize: 14,
//     color: '#64748B',
//   },
//   item: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     borderColor: '#F1F5F9',
//   },
//   itemText: {
//     flex: 1,
//     marginLeft: 16,
//     fontSize: 16,
//     color: '#1E293B',
//   },
//   logoutBtn: {
//     marginTop: 32,
//     backgroundColor: '#EF4444',
//     paddingVertical: 16,
//     borderRadius: 16,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#EF4444',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.35,
//     shadowRadius: 10,
//     elevation: 8,
//   },
//   logoutText: {
//     color: '#ffffff',
//     fontSize: 16,
//     fontWeight: '700',
//     marginLeft: 12,
//   },
// });