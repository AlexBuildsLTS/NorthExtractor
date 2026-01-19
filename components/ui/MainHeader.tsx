import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Modal, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Icons } from "@/components/ui/Icons";
import { useAuth } from "@/context/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import Animated, { FadeInUp, FadeOut } from "react-native-reanimated";

/**
 * AAA+ ENTERPRISE HEADER (FINAL VERSION)
 * - FIX: Right-aligned dropdown to match right-aligned avatar.
 * - FIX: Single source of truth for Role logic (pulls from Profile table).
 * - DESIGN: High-intensity blur with animated dropdown entry.
 */

export const MainHeader = ({ title }: { title: string }) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [showMenu, setShowMenu] = useState(false);

  // Use the profile role from your Supabase auth context
  const rawRole = user?.role || "Member";
  const isAdmin = rawRole.toLowerCase() === "admin";

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
      
      <View style={styles.container}>
        {/* LEFT: IDENTITY & TITLE */}
        <View className="flex-row items-center">
          <View className="mr-3">
             <Text style={styles.headerTitle}>{title.toUpperCase()}</Text>
             <View style={[styles.roleBadge, { backgroundColor: isAdmin ? "rgba(245,158,11,0.15)" : "rgba(79,209,199,0.1)" }]}>
               <Text style={[styles.roleText, { color: isAdmin ? "#F59E0B" : "#4FD1C7" }]}>
                 {rawRole.toUpperCase()}
               </Text>
             </View>
          </View>
        </View>

        {/* RIGHT: PROFILE TRIGGER */}
        <TouchableOpacity onPress={() => setShowMenu(true)} activeOpacity={0.7}>
          <View style={[styles.avatarBox, { borderColor: isAdmin ? "#F59E0B" : "#4FD1C7" }]}>
            {user?.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
            ) : (
              <Icons.User size={20} color={isAdmin ? "#F59E0B" : "#4FD1C7"} />
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* DROPDOWN MENU - RIGHT ANCHORED */}
      <Modal visible={showMenu} transparent animationType="none">
        <Pressable style={styles.modalOverlay} onPress={() => setShowMenu(false)}>
          <Animated.View 
            entering={FadeInUp} 
            exiting={FadeOut}
            style={[styles.dropdown, { top: insets.top + 65 }]}
          >
            <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
            
            <View className="p-6 border-b border-white/5">
              <Text className="text-lg font-black text-white">{user?.full_name || user?.email}</Text>
              <Text className="text-slate-500 text-[10px] font-bold uppercase mt-1 tracking-widest">
                Tier: {rawRole}
              </Text>
            </View>

            <View className="p-2">
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { setShowMenu(false); router.push("/(tabs)/settings/profile"); }}
              >
                <Icons.User size={18} color="#8892B0" />
                <Text className="ml-4 font-bold text-white">Identity Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { setShowMenu(false); router.push("/(tabs)/settings/security"); }}
              >
                <Icons.ShieldCheck size={18} color="#8892B0" />
                <Text className="ml-4 font-bold text-white">Security Vault</Text>
              </TouchableOpacity>

              <View className="h-[1px] bg-white/5 my-2 mx-4" />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { setShowMenu(false); logout(); }}
              >
                <Icons.LogOut size={18} color="#EF4444" />
                <Text className="ml-4 font-bold text-red-500">Terminate Session</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { 
    backgroundColor: "rgba(2, 6, 23, 0.5)", 
    borderBottomWidth: 1, 
    borderBottomColor: "rgba(255,255,255,0.05)",
    zIndex: 100 
  },
  container: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: 20, 
    paddingBottom: 16, 
    paddingTop: 12 
  },
  avatarBox: { 
    width: 42, 
    height: 42, 
    borderRadius: 14, 
    backgroundColor: "#0F172A", 
    alignItems: "center", 
    justifyContent: "center", 
    borderWidth: 1.5 
  },
  avatar: { width: 38, height: 38, borderRadius: 12 },
  headerTitle: { color: "white", fontSize: 13, fontWeight: "900", letterSpacing: 3 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  roleText: { fontSize: 8, fontWeight: "900", letterSpacing: 1 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  dropdown: {
    position: "absolute",
    right: 20, // FIXED: ANCHORED TO RIGHT
    width: 250,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(15, 23, 42, 0.95)",
  },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 16, gap: 4 },
});