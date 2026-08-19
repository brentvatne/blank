import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { colors } from "@/theme/colors";

const ITEMS = [
  {
    id: "stick",
    icon: "figure.hockey",
    title: "Hockey stick",
    note: "Only if you plan to play — Ryan brings a bunch of spares",
  },
  {
    id: "chair",
    icon: "chair.lounge",
    title: "Chair",
    note: "Something comfy for the beach hang",
  },
  {
    id: "drinks",
    icon: "cup.and.saucer",
    title: "Drinks",
    note: "Whatever you like to sip",
  },
  {
    id: "snacks",
    icon: "carrot",
    title: "Snacks",
    note: "We'll have some, but bring anything you're feelin'",
  },
  {
    id: "grill",
    icon: "flame",
    title: "Grill extras",
    note: "We're BBQ'n burgers — bring anything else you want on the grill",
  },
];

export default function BringScreen() {
  const [packed, setPacked] = useState<Record<string, boolean>>({});

  const toggle = (id: string) =>
    setPacked((prev) => ({ ...prev, [id]: !prev[id] }));

  const packedCount = ITEMS.filter((item) => packed[item.id]).length;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 40 }}
    >
      <Text
        style={{
          color: colors.muted,
          fontSize: 15,
          textAlign: "center",
          fontVariant: ["tabular-nums"],
        }}
      >
        {packedCount} of {ITEMS.length} packed
      </Text>

      {ITEMS.map((item) => {
        const isPacked = !!packed[item.id];
        return (
          <Pressable
            key={item.id}
            onPress={() => toggle(item.id)}
            style={({ pressed }) => ({
              backgroundColor: colors.card,
              borderColor: isPacked ? colors.cyan : colors.cardBorder,
              borderWidth: 1,
              borderRadius: 16,
              borderCurve: "continuous",
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Image
              source={`sf:${item.icon}`}
              style={{ width: 28, height: 28 }}
              tintColor={isPacked ? colors.cyan : colors.pink}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.white,
                  fontSize: 17,
                  fontWeight: "700",
                  textDecorationLine: isPacked ? "line-through" : "none",
                }}
              >
                {item.title}
              </Text>
              <Text style={{ color: colors.muted, fontSize: 14 }}>
                {item.note}
              </Text>
            </View>
            <Image
              source={
                isPacked ? "sf:checkmark.circle.fill" : "sf:circle"
              }
              style={{ width: 26, height: 26 }}
              tintColor={isPacked ? colors.cyan : colors.muted}
            />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
