import { Link, Stack } from "expo-router";
import { StyleSheet, View, Text } from "react-native";
import { colors } from "@/lib/design-tokens";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Hups!" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Sivua ei löytynyt</Text>
        <Text style={styles.subtitle}>Tätä sivua ei ole olemassa.</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Takaisin etusivulle</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: 24,
  },
  link: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  linkText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});
