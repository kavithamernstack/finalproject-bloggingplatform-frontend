export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-700 p-6 mt-10 text-center sticky bottom-0 z-50">
      © {new Date().getFullYear()} PostHub. All rights reserved.
    </footer>
  );
}
