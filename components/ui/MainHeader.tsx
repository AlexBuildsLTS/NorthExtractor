// FILE: components/ui/MainHeader.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Icons } from "@/components/ui/Icons";
import { useAuth } from "@/context/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

export const MainHeader = ({ title }: { title: string }) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.container}>
        {/* Profile Trigger - Matches image_995626.png */}
        <TouchableOpacity onPress={() => setShowMenu(true)} activeOpacity={0.7}>
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Icons.User size={18} color="#4FD1C7" />
            </View>
          )}
        </TouchableOpacity>

        <View style={{ alignItems: "center" }}>
          <Text style={styles.headerTitle}>{title.toUpperCase()}</Text>
          <Text style={styles.roleText}>
            {user?.role?.toUpperCase() || "MEMBER"}
          </Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={() => router.push("/ai-chat")}
            activeOpacity={0.7}
          >
            <Icons.MessageCircle size={22} color="#8892B0" />
          </TouchableOpacity>
        </View>
      </View>

      {/* DROPDOWN MENU */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowMenu(false)}
        >
          <View style={[styles.dropdown, { top: insets.top + 60 }]}>
            <BlurView
              intensity={90}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.menuHeader}>
              <Text className="text-white font-black">
                {user?.full_name || "Operator"}
              </Text>
              <Text className="text-[#4FD1C7] text-[10px] font-bold uppercase mt-1">
                Tier: {user?.role || "Member"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                router.push("/(tabs)/settings/profile");
              }}
            >
              <Icons.User size={18} color="#8892B0" />
              <Text style={styles.menuText}>Identity Settings</Text>
            </TouchableOpacity>
            {user?.role === "admin" && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  router.push("/admin");
                }}
              >
                <Icons.Admin size={18} color="#F59E0B" />
                <Text style={styles.menuText}>Admin Console</Text>
              </TouchableOpacity>
            )}
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                logout();
              }}
            >
              <Icons.LogOut size={18} color="#EF4444" />
              <Text style={[styles.menuText, { color: "#EF4444" }]}>
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    backgroundColor: "rgba(2, 6, 23, 0.8)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: "#4FD1C7",
  },
  avatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  headerTitle: {
    color: "white",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 3,
  },
  roleText: {
    color: "#4FD1C7",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginTop: 2,
  },
  actionRow: { flexDirection: "row", gap: 20, alignItems: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  dropdown: {
    position: "absolute",
    left: 20,
    width: 240,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  menuHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    gap: 14,
  },
  menuText: { color: "white", fontWeight: "700", fontSize: 14 },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginHorizontal: 20,
  },
});
