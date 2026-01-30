def calculate_probability(student_rank, program_rank):
    """
    Ögrenci Sıralaması (student_rank) ile Program Sıralaması (program_rank) arasındaki ilişkiyi analiz eder.
    Sıralama ne kadar küçükse (1., 100. vs) o kadar iyidir.

    Mantık:
    - student_rank < program_rank: Öğrenci programdan daha iyi bir derece yapmış. (GÜVENLİ)
      Örn: Öğrenci 5.000, Program 10.000 -> Fark -5.000 -> Güvenli.

    - student_rank > program_rank: Öğrenci programdan daha kötü bir derece yapmış. (RİSKLİ / SÜRPRİZ)
      Örn: Öğrenci 15.000, Program 10.000 -> Fark +5.000 -> Riskli.
    """
    
    if not program_rank or program_rank == 0:
        return "Unknown"

    # Fark yüzdesi: (Öğrenci - Program) / Program
    # Negatif ise (Öğrenci daha iyi) -> Safe
    # Pozitif ise (Öğrenci daha kötü) -> Risky
    diff_ratio = (student_rank - program_rank) / program_rank

    if diff_ratio <= -0.15: # %15 veya daha iyi derece yaptıysa
        return "Safe" # %95 Olasılık
    elif -0.15 < diff_ratio <= 0.20: # %20 kadar kötü olabilir (Esnek İdeal)
        return "Ideal" # %65 Olasılık
    elif 0.20 < diff_ratio <= 0.50: # %20-%50 arası daha kötü (Sürpriz)
        return "Surprise" # %20 Olasılık
    else: 
        return "Dream" # %5 Olasılık (Çok zor)
