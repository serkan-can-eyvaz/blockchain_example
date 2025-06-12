
from Blockchain import Blockchain

def main():
    chain = Blockchain()

    print("Oy verme sistemine hoş geldiniz")
    
    while True:
        print("\n Seçenekler:")
        print("1- Oy Ver")
        print("2- Zinciri Görüntüle")
        print("3- Oy Sayımını Gör")
        print("4- Zincir Bütünlüğünü Kontrol Et")
        print("5- Zinciri Elle Boz")
        print("6- Çıkış")

        secim = input("Seçiminizi Giriniz: ")
        if secim == "1":
            voter_id = input("Voter Id Giriniz: ")
            if chain.has_voted(voter_id):
                print("Bu kullanıcı daha önce oy kullanmış! Oy tekrarına izin verilmez.")
                continue

            vote = input("Hangi adaya oy veriyorsunuz: ")
            transaction = {"voter_id": voter_id, "vote": vote}
            chain.add_transaction(transaction)
            print("Oy eklendi. Blok oluşturuluyor.....")
            chain.mine_pending_transanction()
            print("Oy başarıyla eklendi.")
        elif secim=="2":
            chain.print_chain()
        elif secim=="3":
            print("\n----Oy Sayımı Yapılıyor...---")
            results = chain.count_votes()
            for aday, oy_sayisi in results.items():
                print(f"{aday}: {oy_sayisi} oy")
        elif secim=="4":
            print("\n--Zincir Kontrolü--")
            if chain.is_chain_valid():
                print("Zincir güvende")
            else:
                print("Zincir geçersiz! Veriler kurcalanmış olabilir")
        elif secim == "5":
            print("\n Zincirin 1. bloğundaki veri değiştiriliyor")
            if len(chain.chain) > 1:
                chain.chain[1].transactions[0]["vote"] = "Selman Yakut"
                print("Birinci bloktaki vote değiştirildi")
            else:
                print("Henüz zincirde blok olmadığı için değiştiremezsiniz")
        elif secim == "6":
            print("Programdan çıkılıyor...")
            break
        else:
            print("Geçersiz seçiim! Lütfen 1-6 arasında bir değer giriniz.")   





if __name__ == "__main__":
    main()